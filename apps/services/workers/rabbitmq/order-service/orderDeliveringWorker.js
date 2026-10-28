import envInit from "../../config/envInit.js";
envInit();
import pool from "../../config/dbInit.js";
import logger from "../../config/loggerInit.js";
import { getRedisClient } from "../../config/redisInit.js";
import {
  getChannel,
  ORDER_QUEUES,
  ORDER_ROUTING_KEYS,
} from "../../config/rabbitMQInit.js";

const MAX_ATTEMPTS = process.env.ORDER_DELIVERING_WORKER_MAX_ATTEMPTS
  ? Number(process.env.ORDER_DELIVERING_WORKER_MAX_ATTEMPTS)
  : 3;
const RETRY_DELAY_MS = process.env.ORDER_DELIVERING_WORKER_RETRY_DELAY_MS
  ? Number(process.env.ORDER_DELIVERING_WORKER_RETRY_DELAY_MS)
  : 2000;

const SOCKET_EVENTS_CHANNEL =
  process.env.SOCKET_EVENTS_CHANNEL || "fasteats:order:events";

const QUEUE_NAME = ORDER_QUEUES.find(
  (queue) => queue.routingKey === ORDER_ROUTING_KEYS.DELIVERING
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

const publishStatusChanged = async (order) => {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error("Redis client unavailable");
  }

  const statusData = {
    order_id: order.order_id,
    status: order.status,
    updated_at: order.updated_at,
  };

  await redis.publish(
    SOCKET_EVENTS_CHANNEL,
    JSON.stringify({
      room: `order:${order.order_id}`,
      event: "order.status_changed",
      data: statusData,
    })
  );

  await redis.publish(
    SOCKET_EVENTS_CHANNEL,
    JSON.stringify({
      room: `order:${order.order_id}`,
      event: "orderDelivering",
      data: { ...statusData, delivering_at: order.updated_at },
    })
  );
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
      `☠️ order.delivering exhausted ${attempts} attempts for job ${job.id}; sending to DLQ`
    );
    channel.nack(msg, false, false);
    return;
  }

  logger.warn(
    `🔁 order.delivering attempt ${attempts}/${MAX_ATTEMPTS} failed for job ${job.id}; retrying`
  );
  await sleep(RETRY_DELAY_MS);
  channel.nack(msg, false, true);
};

export const handleOrderDeliveringMessage = async (channel, msg) => {
  let envelope;

  try {
    envelope = JSON.parse(msg.content.toString());
  } catch (error) {
    logger.error(
      "❌ order.delivering message is not valid JSON; sending to DLQ",
      error
    );
    channel.nack(msg, false, false);
    return;
  }

  const eventId = envelope?.event_id;
  const orderId = envelope?.order_id;

  if (!eventId || !orderId) {
    logger.error(
      "❌ order.delivering message missing event_id or order_id; sending to DLQ",
      envelope
    );
    channel.nack(msg, false, false);
    return;
  }

  const job = await claimJob(eventId);

  if (!job) {
    logger.info(
      `↩️ Skipping order.delivering event ${eventId}: already processing/completed or unknown`
    );
    channel.ack(msg);
    return;
  }

  const resolvedOrderId = Number(job.order_id ?? orderId);
  const client = await pool.connect();
  let updatedOrder = null;
  let alreadyTransitioned = false;

  try {
    await client.query("BEGIN");

    const transition = await client.query(
      `UPDATE orders
       SET status = 'Delivering', updated_at = NOW()
       WHERE order_id = $1 AND status = 'Preparing'
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

      if (order?.status === "Delivering") {
        updatedOrder = order;
        alreadyTransitioned = true;
      }
    }

    await client.query("COMMIT");

    if (updatedOrder) {
      await publishStatusChanged(updatedOrder);
      logger.info(
        `✅ order.delivering transitioned order ${resolvedOrderId} to Delivering (job ${job.id}, retransition ${alreadyTransitioned})`
      );
    } else {
      logger.info(
        `↩️ order.delivering skipped for order ${resolvedOrderId}: not in Preparing state (job ${job.id})`
      );
    }

    await markJobCompleted(job.id);
    channel.ack(msg);
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      logger.error(
        "❌ Failed to rollback delivering transaction:",
        rollbackError
      );
    }
    logger.error(
      `❌ order.delivering failed for order ${resolvedOrderId} (job ${job.id}, attempt ${job.attempts}):`,
      error
    );
    await handleFailure(channel, msg, job, error);
  } finally {
    client.release();
  }
};

let activeChannel = null;
let activeConsumerTag = null;

export const startOrderDeliveringWorker = async (existingChannel) => {
  const channel = existingChannel ?? (await getChannel());
  if (!channel) {
    logger.warn(
      "⚠️ RabbitMQ channel unavailable; order.delivering worker not started"
    );
    return null;
  }

  if (activeChannel === channel && activeConsumerTag) {
    return activeConsumerTag;
  }

  await channel.prefetch(1);

  const { consumerTag } = await channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) return;

    handleOrderDeliveringMessage(channel, msg).catch((error) => {
      logger.error("❌ Unhandled order.delivering worker error:", error);
      try {
        channel.nack(msg, false, false);
      } catch (nackError) {
        logger.error("❌ Failed to nack message:", nackError);
      }
    });
  });

  activeChannel = channel;
  activeConsumerTag = consumerTag;

  logger.info(`✅ orderDeliveringWorker consuming "${QUEUE_NAME}"`);
  return consumerTag;
};

export const stopOrderDeliveringWorker = async (consumerTag = activeConsumerTag) => {
  if (!consumerTag) return;

  try {
    if (activeChannel) {
      await activeChannel.cancel(consumerTag);
      logger.info(`🛑 orderDeliveringWorker stopped (${consumerTag})`);
    }
  } catch (error) {
    logger.error("❌ Failed to stop orderDeliveringWorker:", error);
  } finally {
    if (activeConsumerTag === consumerTag) {
      activeConsumerTag = null;
      activeChannel = null;
    }
  }
};
