import Redis from "ioredis";
import logger from "./loggerInit.js";
import envInit from "./envInit.js";

envInit();

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

let redisClient;

export const redisInit = async () => {
  try {
    redisClient = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      enableOfflineQueue: false,
      commandTimeout: 1000,
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        logger.warn(`🔄 Redis reconnecting in ${delay}ms (attempt: ${times})`);
        return delay;
      },
    });

    redisClient.on("connect", () => {
      logger.info(`✅ Redis Connected on ${REDIS_HOST}:${REDIS_PORT}`);
    });

    redisClient.on("error", (err) => {
      logger.error("❌ Redis Connection Failed:", err);
    });

  } catch (error) {
    logger.error("❌ Redis Initialization Error:", error);
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    logger.warn("⏳ Redis Client not initialized. Reconnecting...");
    redisInit();
  }
  return redisClient;
};
