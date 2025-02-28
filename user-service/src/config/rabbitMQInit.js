import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "email_exchange";
const EXCHANGE_TYPE = "direct";
const QUEUE_NAME = "email_verification_queue";
const ROUTING_KEY = "email_verification";

let channel;
let connection;

const rabbitMQInit = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true });

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log(`✅ RabbitMQ Connected & Exchange "${EXCHANGE_NAME}" Initialized`);
  } catch (error) {
    console.error("❌ RabbitMQ Connection Failed:", error);
    setTimeout(rabbitMQInit, 5000);
  }
};

// Fungsi untuk mendapatkan channel yang sudah siap
const getChannel = async () => {
  if (!channel) {
    console.log("⏳ Channel not initialized. Reconnecting...");
    await rabbitMQInit();
  }
  return channel;
};

export { getChannel, rabbitMQInit, EXCHANGE_NAME, ROUTING_KEY };
