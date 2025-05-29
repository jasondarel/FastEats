import { getChannel } from "../config/rabbitMQInit.js";
import { EXCHANGE_NAME, PREPARING_ORDER_ROUTING_KEY, COMPLETED_ORDER_ROUTING_KEY } from "../config/rabbitMQInit.js";
import logger from "../config/loggerInit.js";
import { getOrderJobsByRoutingKeyService, updateOrderJobStatusService } from "../service/orderService.js";

export const publishPreparingOrderMessage = async () => {
  const channel = await getChannel();
  const orderJobs = await getOrderJobsByRoutingKeyService(PREPARING_ORDER_ROUTING_KEY, "pending");

  for (const job of orderJobs) {
    try {
      const { 
        order_id, 
        user_id, 
        status, 
        items, 
        created_at, 
        updated_at, 
        order_type, 
        restaurant_id,
        ownerEmail,
        ownerName,
        customerName,
        customerEmail,
        restaurant
      } = job.payload;

      if (!order_id) {
        logger.error(`❌ Missing order_id in job ${job.id}`);
        continue;
      }

      if (!ownerEmail) {
        logger.error(`❌ Missing ownerEmail in job ${job.id} for order ${order_id}`);
        continue;
      }

      const message = JSON.stringify({
        ownerEmail: ownerEmail,
        ownerName: ownerName || "Valued Owner",
        customerName: customerName || "Customer",
        customerEmail: customerEmail || "email not provided" ,
        order_id: order_id,
        user_id: user_id,
        status: status || "PREPARING",
        order_type: order_type,
        items: Array.isArray(items) ? items : [],
        restaurant_id: restaurant_id,
        restaurant: restaurant || {
          restaurant_name: "Partner Restaurant",
          restaurant_address: "",
          is_open: true
        },
        created_at: created_at,
        updated_at: updated_at
      });

      channel.publish(
        EXCHANGE_NAME,
        PREPARING_ORDER_ROUTING_KEY,
        Buffer.from(message),
        { persistent: true }
      );

      await updateOrderJobStatusService(job.id, "published");

      logger.info(`📨 Sent preparing order message for orderId ${order_id} (userId: ${user_id}) to ${ownerEmail}`);
      
    } catch (error) {
      logger.error(`❌ Failed to process job ID ${job.id}:`, error);
      try {
        await updateOrderJobStatusService(job.id, "failed");
      } catch (updateError) {
        logger.error(`❌ Failed to update job status for job ID ${job.id}:`, updateError);
      }
    }
  }

  logger.info(`Processed ${orderJobs.length} pending 'preparing order' jobs.`);
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
