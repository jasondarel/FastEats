import setupOrderExpiryCron from "./redis/order-service/order-expiry-cron.js";
import setupOutboxPublisher from "./rabbitmq/order-service/outbox-publisher.js";
import { startPaymentCreateWorker } from "./rabbitmq/order-service/paymentCreateWorker.js";
import { startPaymentSettledWorker } from "./rabbitmq/order-service/paymentSettledWorker.js";
import { rabbitMQInit } from "./config/rabbitMQInit.js";
import { redisInit } from "./config/redisInit.js";
import logger from "./config/loggerInit.js";

(async () => {
  setupOrderExpiryCron();
  redisInit();
  await rabbitMQInit();
  setupOutboxPublisher();
  await startPaymentCreateWorker();
  await startPaymentSettledWorker();
  logger.info("✅ Workers service initialized");
})();
