import setupOrderExpiryCron from "./redis/order-service/order-expiry-cron.js";
import setupOutboxPublisher from "./rabbitmq/order-service/outbox-publisher.js";
import { startPaymentCreateWorker } from "./rabbitmq/order-service/paymentCreateWorker.js";
import { startPaymentSettledWorker } from "./rabbitmq/order-service/paymentSettledWorker.js";
import { startOrderDeliveringWorker } from "./rabbitmq/order-service/orderDeliveringWorker.js";
import { startOrderCompletedWorker } from "./rabbitmq/order-service/orderCompletedWorker.js";
import { rabbitMQInit, onRabbitMQReady } from "./config/rabbitMQInit.js";
import { redisInit } from "./config/redisInit.js";
import logger from "./config/loggerInit.js";

const ORDER_CONSUMERS = [
  startPaymentCreateWorker,
  startPaymentSettledWorker,
  startOrderDeliveringWorker,
  startOrderCompletedWorker,
];

(async () => {
  setupOrderExpiryCron();
  redisInit();
  setupOutboxPublisher();

  for (const startConsumer of ORDER_CONSUMERS) {
    onRabbitMQReady((channel) => startConsumer(channel));
  }

  await rabbitMQInit();
  logger.info("✅ Workers service initialized");
})();
