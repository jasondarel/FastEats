import express from "express";
import {

} from "../controllers/transactionController.js";
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
router.delete("/orders/:order_id", deleteOrder);

export default router;
