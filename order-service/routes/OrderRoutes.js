import express from "express";
import {
  createOrderController,
  getOrdersController,
  getOrderByIdController,
  updateOrder,
  deleteOrder,
  cancelOrderController,
} from "../controllers/OrderController.js";
import authMiddleware from "../middleware/apiKeyAuth.js";

const router = express.Router();

router.post("/order", authMiddleware, createOrderController);
router.get("/orders", authMiddleware, getOrdersController);
router.patch("/cancel-order/:order_id", authMiddleware, cancelOrderController);
router.get("/orders/:order_id", getOrderByIdController);
router.put("/orders/:order_id", updateOrder);
router.delete("/orders/:order_id", deleteOrder);

export default router;
