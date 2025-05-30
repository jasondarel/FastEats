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

export const publishCompletedOrderMessage = async () => {
  let channel;
  try {
    channel = await getChannel();
    const orderJobs = await getOrderJobsByRoutingKeyService(COMPLETED_ORDER_ROUTING_KEY, "pending");
    
    if (!orderJobs?.length) {
      logger.info("No pending completed order jobs to process");
      return;
    }
    
    const results = { success: 0, failed: 0 };
    
    for (const job of orderJobs) {
      try {
        const jobPayload = job.payload;

        if (!jobPayload.order_id) {
          logger.error(`❌ Missing order_id in job ${job.id}`);
          await updateOrderJobStatusService(job.id, "failed");
          results.failed++;
          continue;
        }
        
        if (!jobPayload.owner_email) {
          logger.error(`❌ Missing owner_email in job ${job.id} for order ${jobPayload.order_id}`);
          await updateOrderJobStatusService(job.id, "failed");
          results.failed++;
          continue;
        }
        
        const message = JSON.stringify({
          ownerEmail: jobPayload.owner_email,
          ownerName: jobPayload.owner_name || "Valued Owner",
          
          customerName: jobPayload.customer_name || "Customer",
          customerEmail: jobPayload.customer_email || "email not provided",
          
          order_id: jobPayload.order_id,
          user_id: jobPayload.order?.user_id,
          status: "COMPLETED",
          order_type: jobPayload.order?.order_type || "CHECKOUT",
          restaurant_id: jobPayload.order?.restaurant_id,
          
          restaurant: {
            restaurant_name: jobPayload.restaurant_name || "Partner Restaurant",
            restaurant_address: "",
            is_open: true
          },
          
          items: Array.isArray(jobPayload.order?.items) ? jobPayload.order.items : [],
          
          created_at: jobPayload.order?.created_at,
          updated_at: jobPayload.order?.updated_at,
          completed_at: jobPayload.completed_at || new Date()
        });
        
        const published = channel.publish(
          EXCHANGE_NAME,
          COMPLETED_ORDER_ROUTING_KEY,
          Buffer.from(message),
          { persistent: true }
        );
        
        if (!published) {
          throw new Error("Failed to publish message to exchange");
        }
        
        await updateOrderJobStatusService(job.id, "published");
        results.success++;
        
        logger.info(`📨 Sent completed order message for orderId ${jobPayload.order_id} (userId: ${jobPayload.order?.user_id}) to ${jobPayload.owner_email}`);
        
      } catch (error) {
        logger.error(`❌ Failed to process job ID ${job.id}:`, error);
        results.failed++;
        
        try {
          await updateOrderJobStatusService(job.id, "failed");
        } catch (updateError) {
          logger.error(`❌ Failed to update job status for job ID ${job.id}:`, updateError);
        }
      }
    }
    
    logger.info(`✅ Processed ${orderJobs.length} completed order jobs - Success: ${results.success}, Failed: ${results.failed}`);
    
  } catch (error) {
    logger.error("❌ Failed to process completed order messages:", error);
    throw error;
  }
};


