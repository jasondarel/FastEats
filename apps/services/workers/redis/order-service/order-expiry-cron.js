import envInit from "../../config/envInit.js";
envInit();
import cron from "node-cron";
import pool from "../../config/dbInit.js";
import logger from "../../config/loggerInit.js";

const setupOrderExpiryCron = () => {
  // Run every minute to check for expired orders
  cron.schedule("* * * * *", async () => {
    try {
      logger.info("🔄 Running order expiry check...");

      // Find all orders with status 'Pending' that were created more than 30 minutes ago
      const query = `
                UPDATE orders 
                SET status = 'Cancelled', updated_at = NOW()
                WHERE status = 'Pending' 
                AND created_at < NOW() - INTERVAL '30 minutes'
                RETURNING order_id, created_at
            `;

      const result = await pool.query(query);

      if (result.rowCount === 0) {
        logger.info("✅ No expired pending orders found");
        return;
      }

      logger.info(`✅ Cancelled ${result.rowCount} expired order(s):`);
      result.rows.forEach((order) => {
        const age = Math.floor(
          (new Date() - new Date(order.created_at)) / 1000 / 60
        );
        logger.info(`   - Order #${order.order_id} (age: ${age} minutes)`);
      });
    } catch (error) {
      logger.error("❌ Error in order expiry cron job:", error);
    }
  });

  logger.info("✅ Order expiry cron job scheduled (runs every minute)");
  logger.info(
    "   Will cancel orders with status 'Pending' older than 30 minutes"
  );
};

export default setupOrderExpiryCron;
