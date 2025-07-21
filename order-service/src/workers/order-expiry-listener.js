import envInit from "../config/envInit.js";
envInit();

import { getRedisClient } from "../config/redisInit.js";
import Redis from "ioredis";
import logger from "../config/loggerInit.js";
import { updateOrderStatusService } from "../service/orderService.js";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const subscriber = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const publisher = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const redisClient = getRedisClient();

subscriber.subscribe("__keyevent@0__:expired", (err, count) => {
    if (err) {
        logger.error("❌ Failed to subscribe to Redis expired events:", err);
    } else {
        logger.info("✅ Subscribed to Redis key expiry events");
    }
});

subscriber.on("message", async (channel, message) => {
    if (channel === "__keyevent@0__:expired" && message.startsWith("order:")) {
        const orderId = message.split(":")[1];
        logger.info(`⏰ Order expired: ${orderId}`);
        try {
            await publisher.publish("order-events", JSON.stringify({
                event: "orderUpdated",
                data: {
                    order_id: orderId,
                    status: "Cancelled"
                }
            }));
            await updateOrderStatusService(orderId, "Cancelled");
            logger.info(`✅ Order ${orderId} status updated to cancelled.`);
        } catch (error) {
            logger.error(`❌ Failed to update order ${orderId} status:`, error);
        }
    }
});