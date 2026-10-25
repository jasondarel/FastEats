import setupOrderExpiryCron from "./redis/order-service/order-expiry-cron.js";
import { rabbitMQInit } from "./config/rabbitMQInit.js";
import logger from "./config/loggerInit.js";

(async () => {
  setupOrderExpiryCron();
  await rabbitMQInit();
  logger.info("✅ Workers service initialized");
})();
