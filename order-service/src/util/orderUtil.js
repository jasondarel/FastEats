import { getChannel } from "../config/rabbitMQInit.js";
import { EXCHANGE_NAME, PREPARING_ORDER_ROUTING_KEY, COMPLETED_ORDER_ROUTING_KEY } from "../config/rabbitMQInit.js";
import logger from "../config/loggerInit.js";

export const publishPreparingOrderMessage = async (payload) => {
  const channel = await getChannel();

//   const message = JSON.stringify({ email, orderId, completedAt });
    console.log("payload", payload);

//   channel.publish(EXCHANGE_NAME, PREPARING_ORDER_ROUTING_KEY, Buffer.from(message), {
//     persistent: true,
//   });

//   logger.info(`📨 Sent preparing order email to ${email}`);
};

export const publishCompletedOrderMessage = async (payload) => {
  const channel = await getChannel();

//   const message = JSON.stringify({ email, orderId, completedAt });
    console.log("payload", payload);

//   channel.publish(EXCHANGE_NAME, COMPLETED_ORDER_ROUTING_KEY, Buffer.from(message), {
//     persistent: true,
//   });

//   logger.info(`📨 Sent completed order email to ${email}`);
};
