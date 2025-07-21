import envInit from "../config/envInit.js";
envInit();
import { getRedisClient } from "../config/redisInit.js";
import Redis from "ioredis";
import logger from "../config/loggerInit.js";

const setupRedisOrderEvents = (io) => {
    const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
    const REDIS_PORT = process.env.REDIS_PORT || 6379;
    const redisSubscriber = new Redis({ host: REDIS_HOST, port: REDIS_PORT });

    redisSubscriber.subscribe("order-events", (err, count) => {
        if (err) {
            logger.error("❌ Failed to subscribe to order-events channel:", err);
        } else {
            logger.info("✅ Subscribed to Redis channel: order-events");
        }
        });

        redisSubscriber.on("message", (channel, message) => {
        if (channel === "order-events") {
            try {
            const { event, data } = JSON.parse(message);
            logger.info(`📢 Emitting socket event: ${event}`, data);
            io.emit(event, data);
            } catch (err) {
            logger.error("❌ Failed to parse or emit Redis event:", err);
            }
        }
    });
}

export default setupRedisOrderEvents;