import express from "express";
import {
  createOrder,
  getOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/OrderController.js";
import validateOrder from "../middleware/verifyOrder";

const router = express.Router();

router.post("/orders", validateOrder, createOrder);
router.get("/orders", getOrder);
router.get("/orders/:order_id", getOrderById);
router.put("/orders/:order_id", updateOrder);
router.delete("/orders/:order_id", deleteOrder);

export default router;
