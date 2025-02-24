import express from "express";
import {
  createOrderController,
  getOrdersController,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/OrderController.js";
import authMiddleware from "../middleware/apiKeyAuth.js";

const router = express.Router();

router.post("/order", authMiddleware, createOrderController);
router.get("/orders", authMiddleware, getOrdersController);
router.get("/orders/:order_id", getOrderById);
router.put("/orders/:order_id", updateOrder);
router.delete("/orders/:order_id", deleteOrder);

export default router;
