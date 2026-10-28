import envInit from "../../config/envInit.js";
envInit();
import cron from "node-cron";
import pool from "../../config/dbInit.js";
import logger from "../../config/loggerInit.js";
import { cancelExpiredOrder } from "./orderExpiry.js";

const setupOrderExpiryCron = () => {
  // Run every minute to check for expired orders
  cron.schedule("* * * * *", async () => {
    try {
      logger.info("🔄 Running order expiry check...");

      const query = `
                SELECT order_id, created_at
                FROM orders
                WHERE status IN ('Waiting', 'Pending')
                AND created_at < NOW() - INTERVAL '30 minutes'
            `;

      const result = await pool.query(query);

      if (result.rowCount === 0) {
        logger.info("✅ No expired pending orders found");
        return;
      }

      let cancelledCount = 0;

      for (const candidate of result.rows) {
        try {
          const order = await cancelExpiredOrder(candidate.order_id);
          if (!order) continue;

          cancelledCount += 1;
          const age = Math.floor(
            (new Date() - new Date(candidate.created_at)) / 1000 / 60
          );
          logger.info(
            `   - Order #${candidate.order_id} (age: ${age} minutes)`
          );
        } catch (error) {
          logger.error(
            `❌ Failed to cancel expired order #${candidate.order_id}:`,
            error
          );
        }
      }

      logger.info(`✅ Cancelled ${cancelledCount} expired order(s)`);
    } catch (error) {
      logger.error("❌ Error in order expiry cron job:", error);
    }
  });

  logger.info("✅ Order expiry cron job scheduled (runs every minute)");
  logger.info(
    "   Will cancel orders with status 'Waiting' or 'Pending' older than 30 minutes"
  );
};

export default setupOrderExpiryCron;
