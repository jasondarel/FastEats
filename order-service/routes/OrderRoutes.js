import express from "express";
import {
  createOrder,
  getOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/OrderController.js";
import authMiddleware from "../middleware/apiKeyAuth.js";

const router = express.Router();

router.post("/order", authMiddleware, createOrder);
router.get("/orders", getOrder);
router.get("/orders/:order_id", getOrderById);
router.put("/orders/:order_id", updateOrder);
router.delete("/orders/:order_id", deleteOrder);

export default router;
