import express from "express";
import {
  createOrderController,
  getOrdersController,
  getOrderByIdController,
  updateOrder,
  deleteOrder,
  cancelOrderController,
  payOrderController,
  payOrderConfirmationController,
  thanksController,
  checkMidtransStatusController,
  saveSnapTokenController,
  getSnapTokenController
} from "../controllers/OrderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/order", authMiddleware, createOrderController);
router.get("/orders", authMiddleware, getOrdersController);
router.patch("/cancel-order/:order_id", authMiddleware, cancelOrderController);
router.post("/pay-order-confirmation", authMiddleware, payOrderConfirmationController);
router.post("/pay-order", payOrderController);
router.get("/thanks", thanksController);
router.get("/orders/:order_id", authMiddleware, getOrderByIdController);
router.put("/orders/:order_id", updateOrder);
router.get("/check-midtrans-status", checkMidtransStatusController);
router.post("/save-snap-token", saveSnapTokenController);
router.get("/snap/:order_id", getSnapTokenController);
router.delete("/orders/:order_id", deleteOrder);

export default router;
