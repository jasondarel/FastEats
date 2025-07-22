import envInit from "../../config/envInit.js";
envInit();
import axios from "axios";
import Redis from "ioredis";
import { getRedisClient } from "../../config/redisInit.js";
import logger from "../../config/loggerInit.js";

const setupOrderExpiryListener = () => {
    const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
    const REDIS_PORT = process.env.REDIS_PORT || 6379;
    const subscriber = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "your_internal_api_key";
    const GLOBAL_SERVICE_URL = process.env.GLOBAL_SERVICE_URL || "http://localhost:5000";
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
                await axios.put(`${GLOBAL_SERVICE_URL}/order/orders/${orderId}`,
                    {
                        status: "Cancelled"
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${INTERNAL_API_KEY}`,
                            "Content-Type": "application/json"
                        }
                    }
                )
                logger.info(`✅ Order ${orderId} status updated to cancelled.`);
            } catch (error) {
                console.log("Error: ", error);
                logger.error(`❌ Failed to update order ${orderId} status:`, error);
            }
        }
    });
}

export default setupOrderExpiryListener;