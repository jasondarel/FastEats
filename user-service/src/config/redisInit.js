import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

let redisClient;

export const redisInit = async () => {
  try {
    redisClient = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });

    redisClient.on("connect", () => {
      console.log(`✅ Redis Connected on ${REDIS_HOST}:${REDIS_PORT}`);
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis Connection Failed:", err);
      setTimeout(redisInit, 5000); // Retry connection
    });

  } catch (error) {
    console.error("❌ Redis Initialization Error:", error);
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    console.log("⏳ Redis Client not initialized. Reconnecting...");
    redisInit();
  }
  return redisClient;
};
