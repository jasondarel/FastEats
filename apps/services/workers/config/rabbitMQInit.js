import amqp from "amqplib";
import logger from "./loggerInit.js";
import envInit from "./envInit.js";

envInit();

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

export const ORDER_EXCHANGE = process.env.ORDER_EXCHANGE_NAME || "order_exchange";
export const ORDER_DEAD_LETTER_EXCHANGE = process.env.ORDER_DEAD_LETTER_EXCHANGE_NAME || "order_dead_letter_exchange";
export const ORDER_DEAD_LETTER_QUEUE = process.env.ORDER_DEAD_LETTER_QUEUE || "order_dlq";
export const ORDER_DEAD_LETTER_ROUTING_KEY = process.env.ORDER_DEAD_LETTER_ROUTING_KEY || "order.dlq";

export const ORDER_ROUTING_KEYS = {
  PAYMENT_CREATE: process.env.ORDER_PAYMENT_CREATE_ROUTE || "payment.create",
  PAYMENT_SETTLED: process.env.ORDER_PAYMENT_SETTLED_ROUTE || "order.payment.settled",
  DELIVERING: process.env.ORDER_DELIVERING_ROUTE || "order.delivering",
  COMPLETED: process.env.ORDER_COMPLETED_ROUTE || "order.completed",
};

export const ORDER_QUEUES = [
  { name: process.env.ORDER_PAYMENT_CREATE_QUEUE || "order_payment_create_queue", routingKey: ORDER_ROUTING_KEYS.PAYMENT_CREATE },
  { name: process.env.ORDER_PAYMENT_SETTLED_QUEUE || "order_payment_settled_queue", routingKey: ORDER_ROUTING_KEYS.PAYMENT_SETTLED },
  { name: process.env.ORDER_DELIVERING_QUEUE || "order_delivering_queue", routingKey: ORDER_ROUTING_KEYS.DELIVERING },
  { name: process.env.ORDER_COMPLETED_QUEUE || "order_completed_queue", routingKey: ORDER_ROUTING_KEYS.COMPLETED },
];

const EXCHANGE_TYPE = "direct";
const RETRY_DELAY_MS = 5000;

let connection;
let channel;
let connecting = null;
let closing = false;

const buildDeadLetterArguments = () => ({
  "x-dead-letter-exchange": ORDER_DEAD_LETTER_EXCHANGE,
  "x-dead-letter-routing-key": ORDER_DEAD_LETTER_ROUTING_KEY,
});

const setupTopology = async (amqpChannel) => {
  await amqpChannel.assertExchange(ORDER_EXCHANGE, EXCHANGE_TYPE, { durable: true });
  await amqpChannel.assertExchange(ORDER_DEAD_LETTER_EXCHANGE, EXCHANGE_TYPE, { durable: true });

  await amqpChannel.assertQueue(ORDER_DEAD_LETTER_QUEUE, { durable: true });
  await amqpChannel.bindQueue(ORDER_DEAD_LETTER_QUEUE, ORDER_DEAD_LETTER_EXCHANGE, ORDER_DEAD_LETTER_ROUTING_KEY);

  for (const { name, routingKey } of ORDER_QUEUES) {
    await amqpChannel.assertQueue(name, {
      durable: true,
      arguments: buildDeadLetterArguments(),
    });
    await amqpChannel.bindQueue(name, ORDER_EXCHANGE, routingKey);
  }
};

const connect = async () => {
  connection = await amqp.connect(RABBITMQ_URL);

  connection.on("error", (error) => {
    logger.error("❌ RabbitMQ connection error:", error);
  });

  connection.on("close", () => {
    channel = null;
    connection = null;
    if (closing) return;
    logger.warn("⚠️ RabbitMQ connection closed. Reconnecting...");
    setTimeout(rabbitMQInit, RETRY_DELAY_MS);
  });

  channel = await connection.createChannel();
  await setupTopology(channel);

  logger.info(`✅ RabbitMQ Connected & Order Topology "${ORDER_EXCHANGE}" Initialized`);
  logger.info(`   Queues: ${ORDER_QUEUES.map((queue) => queue.name).join(", ")}`);
  logger.info(`   Dead Letter: ${ORDER_DEAD_LETTER_EXCHANGE} -> ${ORDER_DEAD_LETTER_QUEUE}`);
};

export const rabbitMQInit = async () => {
  if (channel) return channel;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      await connect();
      return channel;
    } catch (error) {
      logger.error("❌ RabbitMQ Connection Failed:", error);
      channel = null;
      connection = null;
      setTimeout(rabbitMQInit, RETRY_DELAY_MS);
      return null;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
};

export const getChannel = async () => {
  if (!channel) {
    logger.warn("⏳ RabbitMQ channel not initialized. Reconnecting...");
    await rabbitMQInit();
  }
  return channel;
};

export const closeRabbitMQ = async () => {
  try {
    closing = true;
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (error) {
    logger.error("❌ Failed to close RabbitMQ connection:", error);
  } finally {
    channel = null;
    connection = null;
    closing = false;
  }
};
