import express from "express";
import {
  createOrder,
  getOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/OrderController.js";

const router = express.Router();

router.post("/orders", createOrder);
router.get("/orders", getOrder);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);

export default router;
