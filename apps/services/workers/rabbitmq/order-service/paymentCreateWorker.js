import envInit from "../../config/envInit.js";
envInit();
import axios from "axios";
import pool from "../../config/dbInit.js";
import logger from "../../config/loggerInit.js";
import { getRedisClient } from "../../config/redisInit.js";
import {
  getChannel,
  ORDER_QUEUES,
  ORDER_ROUTING_KEYS,
} from "../../config/rabbitMQInit.js";

const MAX_ATTEMPTS = process.env.PAYMENT_WORKER_MAX_ATTEMPTS
  ? Number(process.env.PAYMENT_WORKER_MAX_ATTEMPTS)
  : 3;
const RETRY_DELAY_MS = process.env.PAYMENT_WORKER_RETRY_DELAY_MS
  ? Number(process.env.PAYMENT_WORKER_RETRY_DELAY_MS)
  : 2000;

const SOCKET_EVENTS_CHANNEL =
  process.env.SOCKET_EVENTS_CHANNEL || "fasteats:order:events";

const QUEUE_NAME = ORDER_QUEUES.find(
  (queue) => queue.routingKey === ORDER_ROUTING_KEYS.PAYMENT_CREATE
).name;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const claimJob = async (eventId) => {
  const result = await pool.query(
    `UPDATE order_jobs
     SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
     WHERE event_id = $1 AND status IN ('pending', 'published')
     RETURNING *`,
    [eventId]
  );

  return result.rowCount === 0 ? null : result.rows[0];
};

const getSnapByOrderId = async (orderId) => {
  const result = await pool.query(
    "SELECT * FROM snaps WHERE order_id = $1",
    [orderId]
  );
  return result.rows[0];
};

const upsertSnap = async (orderId, snapToken, redirectUrl) => {
  const result = await pool.query(
    `INSERT INTO snaps (order_id, snap_token, redirect_url)
     VALUES ($1, $2, $3)
     ON CONFLICT (order_id) DO UPDATE
     SET snap_token = EXCLUDED.snap_token,
         redirect_url = EXCLUDED.redirect_url,
         updated_at = NOW()
     RETURNING *`,
    [orderId, snapToken, redirectUrl]
  );
  return result.rows[0];
};

const createSnapTransaction = async (orderId, payload) => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const snapUrl = process.env.MIDTRANS_SNAP_URL;

  if (!serverKey || !snapUrl) {
    throw new Error("Midtrans configuration missing");
  }

  const shipping = payload.shipping || {};
  const itemPrice = Number(payload.item_price ?? payload.itemPrice ?? 0);
  const tax = Number(payload.tax ?? 0);
  const grossAmount = Math.round(
    Number(payload.gross_amount ?? payload.grossAmount ?? itemPrice + tax)
  );

  if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
    throw new Error(`Invalid gross_amount for order ${orderId}: ${grossAmount}`);
  }

  const base64Auth = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;

  const response = await axios.post(
    snapUrl,
    {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: grossAmount,
      },
      custom_field1: [
        shipping.province ?? shipping.shipping_province,
        shipping.city ?? shipping.shipping_city,
        shipping.district ?? shipping.shipping_district,
        shipping.village ?? shipping.shipping_village,
        shipping.address ?? shipping.shipping_address,
        shipping.phone ?? shipping.shipping_phone,
        shipping.name ?? shipping.shipping_name,
      ],
      custom_field2: [tax, itemPrice],
      credit_card: { secure: true },
      isProduction: process.env.IS_PRODUCTION,
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: base64Auth,
      },
    }
  );

  const snapToken = response.data?.token;
  if (!snapToken) {
    throw new Error("Midtrans response missing token");
  }

  return {
    snapToken,
    redirectUrl: response.data?.redirect_url ?? null,
  };
};

const publishPaymentReady = async (orderId, snap) => {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error("Redis client unavailable");
  }

  const message = JSON.stringify({
    room: `order:${orderId}`,
    event: "payment.ready",
    data: {
      order_id: orderId,
      snap_token: snap.snap_token,
      redirect_url: snap.redirect_url ?? null,
    },
  });

  await redis.publish(SOCKET_EVENTS_CHANNEL, message);
};

const handleFailure = async (channel, msg, job, error) => {
  const attempts = job.attempts;
  const exhausted = attempts >= MAX_ATTEMPTS;

  await pool.query(
    `UPDATE order_jobs
     SET status = $2, last_error = $3, updated_at = NOW()
     WHERE id = $1`,
    [job.id, exhausted ? "failed" : "published", String(error?.message || error)]
  );

  if (exhausted) {
    logger.error(
      `☠️ payment.create exhausted ${attempts} attempts for job ${job.id}; sending to DLQ`
    );
    channel.nack(msg, false, false);
    return;
  }

  logger.warn(
    `🔁 payment.create attempt ${attempts}/${MAX_ATTEMPTS} failed for job ${job.id}; retrying`
  );
  await sleep(RETRY_DELAY_MS);
  channel.nack(msg, false, true);
};

export const handlePaymentCreateMessage = async (channel, msg) => {
  let envelope;

  try {
    envelope = JSON.parse(msg.content.toString());
  } catch (error) {
    logger.error("❌ payment.create message is not valid JSON; sending to DLQ", error);
    channel.nack(msg, false, false);
    return;
  }

  const eventId = envelope?.event_id;
  const orderId = envelope?.order_id;

  if (!eventId || !orderId) {
    logger.error(
      "❌ payment.create message missing event_id or order_id; sending to DLQ",
      envelope
    );
    channel.nack(msg, false, false);
    return;
  }

  const job = await claimJob(eventId);

  if (!job) {
    logger.info(
      `↩️ Skipping payment.create event ${eventId}: already processing/completed or unknown`
    );
    channel.ack(msg);
    return;
  }

  const resolvedOrderId = job.order_id ?? orderId;
  const payload = job.payload || envelope.payload || {};

  try {
    let snap = await getSnapByOrderId(resolvedOrderId);

    if (snap?.snap_token) {
      logger.info(
        `♻️ Reusing existing Snap token for order ${resolvedOrderId} (job ${job.id})`
      );
    } else {
      const created = await createSnapTransaction(resolvedOrderId, payload);
      snap = await upsertSnap(
        resolvedOrderId,
        created.snapToken,
        created.redirectUrl
      );
    }

    await publishPaymentReady(resolvedOrderId, snap);

    await pool.query(
      `UPDATE order_jobs
       SET status = 'completed', last_error = NULL, updated_at = NOW()
       WHERE id = $1`,
      [job.id]
    );

    channel.ack(msg);
    logger.info(
      `✅ payment.create completed for order ${resolvedOrderId} (job ${job.id})`
    );
  } catch (error) {
    logger.error(
      `❌ payment.create failed for order ${resolvedOrderId} (job ${job.id}, attempt ${job.attempts}):`,
      error
    );
    await handleFailure(channel, msg, job, error);
  }
};

let activeChannel = null;
let activeConsumerTag = null;

export const startPaymentCreateWorker = async (existingChannel) => {
  const channel = existingChannel ?? (await getChannel());
  if (!channel) {
    logger.warn("⚠️ RabbitMQ channel unavailable; payment.create worker not started");
    return null;
  }

  if (activeChannel === channel && activeConsumerTag) {
    return activeConsumerTag;
  }

  await channel.prefetch(1);

  const { consumerTag } = await channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) return;

    handlePaymentCreateMessage(channel, msg).catch((error) => {
      logger.error("❌ Unhandled payment.create worker error:", error);
      try {
        channel.nack(msg, false, false);
      } catch (nackError) {
        logger.error("❌ Failed to nack message:", nackError);
      }
    });
  });

  activeChannel = channel;
  activeConsumerTag = consumerTag;

  logger.info(`✅ paymentCreateWorker consuming "${QUEUE_NAME}"`);
  return consumerTag;
};

export const stopPaymentCreateWorker = async (consumerTag = activeConsumerTag) => {
  if (!consumerTag) return;

  try {
    if (activeChannel) {
      await activeChannel.cancel(consumerTag);
      logger.info(`🛑 paymentCreateWorker stopped (${consumerTag})`);
    }
  } catch (error) {
    logger.error("❌ Failed to stop paymentCreateWorker:", error);
  } finally {
    if (activeConsumerTag === consumerTag) {
      activeConsumerTag = null;
      activeChannel = null;
    }
  }
};
