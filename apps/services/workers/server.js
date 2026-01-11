import { redisInit } from "./config/redisInit.js";
import setupOrderExpiryListener from "./redis/order-service/order-expiry-listener.js";

(async () => {
    await redisInit();
    setupOrderExpiryListener();
})();