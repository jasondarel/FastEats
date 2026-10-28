import envInit from "../../config/envInit.js";
envInit();
import Redis from "ioredis";
import logger from "../../config/loggerInit.js";
import { cancelExpiredOrder } from "./orderExpiry.js";

const EXPIRED_EVENT = "__keyevent@0__:expired";
const ORDER_KEY_PREFIX = "order:";

const setupOrderExpiryListener = () => {
  const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
  const REDIS_PORT = process.env.REDIS_PORT || 6379;

  const subscriber = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 3000);
      logger.warn(
        `🔄 Order expiry subscriber reconnecting in ${delay}ms (attempt: ${times})`
      );
      return delay;
    },
  });

  subscriber.on("error", (err) => {
    logger.error("❌ Order expiry subscriber error:", err);
  });

  subscriber.on("ready", () => {
    subscriber.subscribe(EXPIRED_EVENT, (err) => {
      if (err) {
        logger.error("❌ Failed to subscribe to Redis expired events:", err);
        return;
      }
      logger.info("✅ Subscribed to Redis key expiry events");
    });
  });

  subscriber.on("message", async (channel, message) => {
    if (channel !== EXPIRED_EVENT || !message.startsWith(ORDER_KEY_PREFIX)) {
      return;
    }

    const orderId = Number.parseInt(
      message.slice(ORDER_KEY_PREFIX.length),
      10
    );

    if (!Number.isInteger(orderId)) {
      logger.warn(`⚠️ Ignoring malformed expired order key: ${message}`);
      return;
    }

    logger.info(`⏰ Order expired: ${orderId}`);

    try {
      const order = await cancelExpiredOrder(orderId);
      if (order) {
        logger.info(`✅ Order ${orderId} status updated to cancelled`);
      } else {
        logger.info(
          `ℹ️ Order ${orderId} no longer Waiting/Pending, expiry skipped`
        );
      }
    } catch (error) {
      logger.error(`❌ Failed to expire order ${orderId}:`, error);
    }
  });

  return subscriber;
};

export default setupOrderExpiryListener;
