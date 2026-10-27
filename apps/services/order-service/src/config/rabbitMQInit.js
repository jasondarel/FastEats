import amqp from "amqplib";
import logger from "./loggerInit.js";
import envInit from "./envInit.js";

envInit();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
export const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "notification_exchange";
const EXCHANGE_TYPE = process.env.EXCHANGE_TYPE || "direct";
export const PREPARING_ORDER_QUEUE =
  process.env.PREPARING_ORDER_QUEUE || "order_preparing_notification_queue";
export const COMPLETED_ORDER_QUEUE =
  process.env.COMPLETED_ORDER_QUEUE || "order_completed_notification_queue";

export const PREPARING_ORDER_ROUTING_KEY = process.env.EMAIL_PREPARING_ORDER_ROUTE || "preparing_order";
export const COMPLETED_ORDER_ROUTING_KEY = process.env.EMAIL_COMPLETED_ORDER_ROUTE || "completed_order";
export const PAYMENT_CREATE_ROUTING_KEY = process.env.ORDER_PAYMENT_CREATE_ROUTE || "payment.create";
export const PAYMENT_SETTLED_ROUTING_KEY = process.env.ORDER_PAYMENT_SETTLED_ROUTE || "order.payment.settled";
export const ORDER_DELIVERING_ROUTING_KEY = process.env.ORDER_DELIVERING_ROUTE || "order.delivering";
export const ORDER_COMPLETED_ROUTING_KEY = process.env.ORDER_COMPLETED_ROUTE || "order.completed";

let channel;
let connection;

export const rabbitMQInit = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(PREPARING_ORDER_QUEUE, { durable: true });
    await channel.assertQueue(COMPLETED_ORDER_QUEUE, { durable: true });

    await channel.bindQueue(
      PREPARING_ORDER_QUEUE,
      EXCHANGE_NAME,
      PREPARING_ORDER_ROUTING_KEY
    );
    await channel.bindQueue(
      COMPLETED_ORDER_QUEUE,
      EXCHANGE_NAME,
      COMPLETED_ORDER_ROUTING_KEY
    );

    logger.info(`✅ RabbitMQ Connected & Exchange "${EXCHANGE_NAME}" Initialized`);
    logger.info(
      `   Notification queues: ${PREPARING_ORDER_QUEUE} (${PREPARING_ORDER_ROUTING_KEY}), ${COMPLETED_ORDER_QUEUE} (${COMPLETED_ORDER_ROUTING_KEY})`
    );
  } catch (error) {
    logger.error("❌ RabbitMQ Connection Failed:", error);
    setTimeout(rabbitMQInit, 5000);
  }
};

export const getChannel = async () => {
  if (!channel) {
    logger.warn("⏳ Channel not initialized. Reconnecting...");
    await rabbitMQInit();
  }
  return channel;
};
