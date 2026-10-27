import envInit from "../../config/envInit.js";
envInit();
import pool from "../../config/dbInit.js";
import logger from "../../config/loggerInit.js";
import {
  getChannel,
  NOTIFICATION_EXCHANGE,
  NOTIFICATION_ROUTING_KEYS,
  ORDER_EXCHANGE,
  ORDER_ROUTING_KEYS,
} from "../../config/rabbitMQInit.js";

const POLL_INTERVAL_MS = process.env.OUTBOX_POLL_INTERVAL_MS
  ? Number(process.env.OUTBOX_POLL_INTERVAL_MS)
  : 5000;
const BATCH_SIZE = process.env.OUTBOX_BATCH_SIZE
  ? Number(process.env.OUTBOX_BATCH_SIZE)
  : 20;
const MAX_ATTEMPTS = process.env.OUTBOX_MAX_ATTEMPTS
  ? Number(process.env.OUTBOX_MAX_ATTEMPTS)
  : 3;

const ORDER_ROUTING_KEY_VALUES = Object.values(ORDER_ROUTING_KEYS);
const NOTIFICATION_ROUTING_KEY_VALUES = Object.values(NOTIFICATION_ROUTING_KEYS);
const ROUTING_KEY_VALUES = [
  ...ORDER_ROUTING_KEY_VALUES,
  ...NOTIFICATION_ROUTING_KEY_VALUES,
];

const isNotificationRoutingKey = (routingKey) =>
  NOTIFICATION_ROUTING_KEY_VALUES.includes(routingKey);

let isRunning = false;

const buildEnvelope = (job) => ({
  event_id: job.event_id,
  event: job.routing_key,
  order_id: job.order_id,
  payload: job.payload,
  timestamp: new Date().toISOString(),
});

const markFailedAttempt = async (client, job, error) => {
  await client.query(
    `UPDATE order_jobs
     SET attempts = attempts + 1,
         last_error = $2,
         status = CASE WHEN attempts + 1 >= $3 THEN 'failed' ELSE 'pending' END,
         updated_at = NOW()
     WHERE id = $1`,
    [job.id, String(error?.message || error), MAX_ATTEMPTS]
  );
};

const publishJob = async (client, channel, job) => {
  try {
    const isNotification = isNotificationRoutingKey(job.routing_key);
    const exchange = isNotification ? NOTIFICATION_EXCHANGE : ORDER_EXCHANGE;
    const message = isNotification
      ? JSON.stringify(job.payload ?? {})
      : JSON.stringify(buildEnvelope(job));

    channel.publish(exchange, job.routing_key, Buffer.from(message), {
      persistent: true,
      contentType: "application/json",
      messageId: job.event_id,
    });

    await channel.waitForConfirms();

    await client.query(
      `UPDATE order_jobs
       SET status = 'published', updated_at = NOW()
       WHERE id = $1`,
      [job.id]
    );

    logger.info(
      `📤 Published job ${job.id} (${job.routing_key}) to ${exchange}`
    );
    return true;
  } catch (error) {
    logger.error(`❌ Failed to publish job ${job.id}:`, error);
    await markFailedAttempt(client, job, error);
    return false;
  }
};

export const publishPendingJobs = async () => {
  const channel = await getChannel();
  if (!channel) {
    logger.warn("⚠️ RabbitMQ channel unavailable; skipping outbox run");
    return 0;
  }

  const client = await pool.connect();
  let publishedCount = 0;

  try {
    await client.query("BEGIN");

    const { rows: jobs } = await client.query(
      `SELECT *
       FROM order_jobs
       WHERE status = 'pending'
         AND routing_key = ANY($1::text[])
       ORDER BY created_at ASC
       LIMIT $2
       FOR UPDATE SKIP LOCKED`,
      [ROUTING_KEY_VALUES, BATCH_SIZE]
    );

    for (const job of jobs) {
      const published = await publishJob(client, channel, job);
      if (published) publishedCount++;
    }

    await client.query("COMMIT");

    if (publishedCount > 0) {
      logger.info(`✅ Outbox run published ${publishedCount} job(s)`);
    }

    return publishedCount;
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("❌ Outbox publisher run failed:", error);
    return publishedCount;
  } finally {
    client.release();
  }
};

const setupOutboxPublisher = () => {
  const run = async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      await publishPendingJobs();
    } catch (error) {
      logger.error("❌ Outbox publisher error:", error);
    } finally {
      isRunning = false;
    }
  };

  run();
  const timer = setInterval(run, POLL_INTERVAL_MS);

  logger.info(
    `✅ Outbox publisher scheduled (every ${POLL_INTERVAL_MS}ms, batch ${BATCH_SIZE}, max attempts ${MAX_ATTEMPTS})`
  );

  return () => clearInterval(timer);
};

export default setupOutboxPublisher;
