import amqp from "amqplib";
import logger from "./loggerInit.js";
import envInit from "./envInit.js";

envInit();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
export const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "email_exchange";
const EXCHANGE_TYPE = process.env.EXCHANGE_TYPE || "direct";
const QUEUE_NAME = process.env.QUEUE_NAME || "email_verification_queue";

export const PREPARING_ORDER_ROUTING_KEY = process.env.EMAIL_PREPARING_ORDER_ROUTE || "preparing_order";
export const COMPLETED_ORDER_ROUTING_KEY = process.env.EMAIL_COMPLETED_ORDER_ROUTE || "completed_order";

let channel;
let connection;

export const rabbitMQInit = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, PREPARING_ORDER_ROUTING_KEY);
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, COMPLETED_ORDER_ROUTING_KEY);

    logger.info(`✅ RabbitMQ Connected & Exchange "${EXCHANGE_NAME}" Initialized`);
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
