import amqp from "amqplib";
import logger from "./loggerInit.js";
import envInit from "./envInit.js";

envInit();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
export const EXCHANGE_NAME = process.env.EXCHANGE_NAME || "notification_exchange";
const EXCHANGE_TYPE = process.env.EXCHANGE_TYPE || "direct";

export const USER_VERIFICATION_QUEUE = process.env.USER_VERIFICATION_QUEUE || "email_verification_queue";
export const EMAIL_VERIFICATION_ROUTING_KEY = process.env.EMAIL_VERIFICATION_USER_ROUTE || "email.verification.user";


export const USER_RESET_QUEUE = process.env.USER_RESET_QUEUE || "email_reset_queue";
export const EMAIL_RESET_PASSWORD_ROUTING_KEY = process.env.EMAIL_RESET_PASSWORD_ROUTE || "email.reset.password";

let channel;
let connection;

export const rabbitMQInit = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });

    await channel.assertQueue(USER_VERIFICATION_QUEUE, { durable: true });
    await channel.assertQueue(USER_RESET_QUEUE, { durable: true });
    
    await channel.bindQueue(USER_VERIFICATION_QUEUE, EXCHANGE_NAME, EMAIL_VERIFICATION_ROUTING_KEY);
    await channel.bindQueue(USER_RESET_QUEUE, EXCHANGE_NAME, EMAIL_RESET_PASSWORD_ROUTING_KEY);
    
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
