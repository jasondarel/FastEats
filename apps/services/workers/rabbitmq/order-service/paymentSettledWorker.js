import envInit from "../../config/envInit.js";
envInit();
import pool from "../../config/dbInit.js";
import logger from "../../config/loggerInit.js";
import { getRedisClient } from "../../config/redisInit.js";
import {
  getChannel,
  NOTIFICATION_ROUTING_KEYS,
  ORDER_QUEUES,
  ORDER_ROUTING_KEYS,
} from "../../config/rabbitMQInit.js";

const MAX_ATTEMPTS = process.env.PAYMENT_SETTLED_WORKER_MAX_ATTEMPTS
  ? Number(process.env.PAYMENT_SETTLED_WORKER_MAX_ATTEMPTS)
  : 3;
const RETRY_DELAY_MS = process.env.PAYMENT_SETTLED_WORKER_RETRY_DELAY_MS
  ? Number(process.env.PAYMENT_SETTLED_WORKER_RETRY_DELAY_MS)
  : 2000;

const SOCKET_EVENTS_CHANNEL =
  process.env.SOCKET_EVENTS_CHANNEL || "fasteats:order:events";

const QUEUE_NAME = ORDER_QUEUES.find(
  (queue) => queue.routingKey === ORDER_ROUTING_KEYS.PAYMENT_SETTLED
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

const markJobCompleted = async (jobId) => {
  await pool.query(
    `UPDATE order_jobs
     SET status = 'completed', last_error = NULL, updated_at = NOW()
     WHERE id = $1`,
    [jobId]
  );
};

const upsertTransaction = async (client, orderId, transaction) => {
  if (!transaction || typeof transaction !== "object") return null;

  const existing = await client.query(
    "SELECT transaction_id FROM transactions WHERE order_id = $1 LIMIT 1",
    [orderId]
  );

  if (existing.rowCount > 0) {
    const result = await client.query(
      `UPDATE transactions SET
         currency = $1,
         transaction_time = $2,
         expiry_time = $3,
         bank = $4,
         va_number = $5,
         payment_type = $6,
         shipping_province = $7,
         shipping_city = $8,
         shipping_district = $9,
         shipping_village = $10,
         shipping_address = $11,
         shipping_phone = $12,
         shipping_name = $13,
         transaction_gross = $14,
         transaction_net = $15,
         tax = $16,
         updated_at = NOW()
       WHERE transaction_id = $17
       RETURNING *`,
      [
        transaction.currency ?? null,
        transaction.transaction_time ?? null,
        transaction.expiry_time ?? null,
        transaction.bank ?? null,
        transaction.va_number ?? null,
        transaction.payment_type ?? null,
        transaction.shipping_province ?? "unknown",
        transaction.shipping_city ?? "unknown",
        transaction.shipping_district ?? "unknown",
        transaction.shipping_village ?? "unknown",
        transaction.shipping_address ?? "unknown",
        transaction.shipping_phone ?? "unknown",
        transaction.shipping_name ?? "unknown",
        Number(transaction.gross_amount) || 0,
        Number(transaction.transaction_net) || 0,
        Number(transaction.tax) || 0,
        existing.rows[0].transaction_id,
      ]
    );
    return result.rows[0];
  }

  const result = await client.query(
    `INSERT INTO transactions
       (order_id, currency, transaction_time, expiry_time, bank, va_number,
        payment_type, shipping_province, shipping_city, shipping_district,
        shipping_village, shipping_address, shipping_phone, shipping_name,
        transaction_gross, transaction_net, tax)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     RETURNING *`,
    [
      orderId,
      transaction.currency ?? null,
      transaction.transaction_time ?? null,
      transaction.expiry_time ?? null,
      transaction.bank ?? null,
      transaction.va_number ?? null,
      transaction.payment_type ?? null,
      transaction.shipping_province ?? "unknown",
      transaction.shipping_city ?? "unknown",
      transaction.shipping_district ?? "unknown",
      transaction.shipping_village ?? "unknown",
      transaction.shipping_address ?? "unknown",
      transaction.shipping_phone ?? "unknown",
      transaction.shipping_name ?? "unknown",
      Number(transaction.gross_amount) || 0,
      Number(transaction.transaction_net) || 0,
      Number(transaction.tax) || 0,
    ]
  );
  return result.rows[0];
};

const buildPreparingNotificationPayload = (orderDetails, order) => {
  if (!orderDetails || typeof orderDetails !== "object") return null;

  return {
    ...orderDetails,
    status: "Preparing",
    updated_at: order?.updated_at ?? orderDetails.updated_at,
  };
};

const createPreparingOrderJob = async (client, orderId, payload) => {
  const result = await client.query(
    `INSERT INTO order_jobs (order_id, payload, routing_key)
     VALUES ($1, $2, $3) RETURNING *`,
    [orderId, payload, NOTIFICATION_ROUTING_KEYS.PREPARING]
  );
  return result.rows[0];
};

const publishStatusChanged = async (order) => {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error("Redis client unavailable");
  }

  const message = JSON.stringify({
    room: `order:${order.order_id}`,
    event: "order.status_changed",
    data: {
      order_id: order.order_id,
      status: order.status,
      updated_at: order.updated_at,
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
      `☠️ order.payment.settled exhausted ${attempts} attempts for job ${job.id}; sending to DLQ`
    );
    channel.nack(msg, false, false);
    return;
  }

  logger.warn(
    `🔁 order.payment.settled attempt ${attempts}/${MAX_ATTEMPTS} failed for job ${job.id}; retrying`
  );
  await sleep(RETRY_DELAY_MS);
  channel.nack(msg, false, true);
};

export const handlePaymentSettledMessage = async (channel, msg) => {
  let envelope;

  try {
    envelope = JSON.parse(msg.content.toString());
  } catch (error) {
    logger.error(
      "❌ order.payment.settled message is not valid JSON; sending to DLQ",
      error
    );
    channel.nack(msg, false, false);
    return;
  }

  const eventId = envelope?.event_id;
  const orderId = envelope?.order_id;

  if (!eventId || !orderId) {
    logger.error(
      "❌ order.payment.settled message missing event_id or order_id; sending to DLQ",
      envelope
    );
    channel.nack(msg, false, false);
    return;
  }

  const job = await claimJob(eventId);

  if (!job) {
    logger.info(
      `↩️ Skipping order.payment.settled event ${eventId}: already processing/completed or unknown`
    );
    channel.ack(msg);
    return;
  }

  const resolvedOrderId = Number(job.order_id ?? orderId);
  const payload = job.payload || envelope.payload || {};
  const client = await pool.connect();
  let updatedOrder = null;
  let alreadyTransitioned = false;

  try {
    await client.query("BEGIN");

    const transition = await client.query(
      `UPDATE orders
       SET status = 'Preparing', updated_at = NOW()
       WHERE order_id = $1 AND status IN ('Pending', 'Waiting')
       RETURNING *`,
      [resolvedOrderId]
    );

    updatedOrder = transition.rows[0] ?? null;

    if (!updatedOrder && job.attempts > 1) {
      const existing = await client.query(
        "SELECT * FROM orders WHERE order_id = $1",
        [resolvedOrderId]
      );
      const order = existing.rows[0];

      if (order?.status === "Preparing") {
        updatedOrder = order;
        alreadyTransitioned = true;
      }
    }

    let notificationJob = null;

    if (updatedOrder && !alreadyTransitioned) {
      await upsertTransaction(client, resolvedOrderId, payload.transaction);

      const notificationPayload = buildPreparingNotificationPayload(
        payload.order_details,
        updatedOrder
      );

      if (notificationPayload) {
        notificationJob = await createPreparingOrderJob(
          client,
          resolvedOrderId,
          notificationPayload
        );
      } else {
        logger.warn(
          `No order details in settlement payload for order ${resolvedOrderId}; skipping preparing notification`
        );
      }
    }

    await client.query("COMMIT");

    if (updatedOrder) {
      await publishStatusChanged(updatedOrder);
      logger.info(
        `✅ order.payment.settled transitioned order ${resolvedOrderId} to Preparing (job ${job.id}, notification job ${notificationJob?.id ?? "none"}, retransition ${alreadyTransitioned})`
      );
    } else {
      logger.info(
        `↩️ order.payment.settled skipped for order ${resolvedOrderId}: not in Pending/Waiting state (job ${job.id})`
      );
    }

    await markJobCompleted(job.id);
    channel.ack(msg);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      logger.error("❌ Failed to rollback settlement transaction:", rollbackError);
    }
    logger.error(
      `❌ order.payment.settled failed for order ${resolvedOrderId} (job ${job.id}, attempt ${job.attempts}):`,
      error
    );
    await handleFailure(channel, msg, job, error);
  } finally {
    client.release();
  }
};

let activeChannel = null;
let activeConsumerTag = null;

export const startPaymentSettledWorker = async (existingChannel) => {
  const channel = existingChannel ?? (await getChannel());
  if (!channel) {
    logger.warn(
      "⚠️ RabbitMQ channel unavailable; order.payment.settled worker not started"
    );
    return null;
  }

  if (activeChannel === channel && activeConsumerTag) {
    return activeConsumerTag;
  }

  await channel.prefetch(1);

  const { consumerTag } = await channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) return;

    handlePaymentSettledMessage(channel, msg).catch((error) => {
      logger.error("❌ Unhandled order.payment.settled worker error:", error);
      try {
        channel.nack(msg, false, false);
      } catch (nackError) {
        logger.error("❌ Failed to nack message:", nackError);
      }
    });
  });

  activeChannel = channel;
  activeConsumerTag = consumerTag;

  logger.info(`✅ paymentSettledWorker consuming "${QUEUE_NAME}"`);
  return consumerTag;
};

export const stopPaymentSettledWorker = async (consumerTag = activeConsumerTag) => {
  if (!consumerTag) return;

  try {
    if (activeChannel) {
      await activeChannel.cancel(consumerTag);
      logger.info(`🛑 paymentSettledWorker stopped (${consumerTag})`);
    }
  } catch (error) {
    logger.error("❌ Failed to stop paymentSettledWorker:", error);
  } finally {
    if (activeConsumerTag === consumerTag) {
      activeConsumerTag = null;
      activeChannel = null;
    }
  }
};
