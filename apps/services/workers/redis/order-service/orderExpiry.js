import envInit from "../../config/envInit.js";
envInit();
import pool from "../../config/dbInit.js";
import logger from "../../config/loggerInit.js";
import { publishStatusChanged } from "./orderEvents.js";

export const cancelExpiredOrder = async (orderId) => {
  const result = await pool.query(
    `UPDATE orders
     SET status = 'Cancelled', updated_at = NOW()
     WHERE order_id = $1 AND status IN ('Waiting', 'Pending')
     RETURNING *`,
    [orderId]
  );

  const order = result.rows[0];
  if (!order) return null;

  try {
    await publishStatusChanged(order);
  } catch (error) {
    logger.error(
      `❌ Failed to publish cancellation for order ${orderId}:`,
      error
    );
  }

  return order;
};
