import express from "express";
import {
  createOrderController,
  getOrdersController,
  getOrderByIdController,
  updateOrder,
  deleteOrder,
  cancelOrderController,
  completeOrderController,
  payOrderController,
  payOrderConfirmationController,
  thanksController,
  checkMidtransStatusController,
  saveSnapTokenController,
  getSnapTokenController,
  getOrdersByRestaurantIdController,
  getRestaurantOrderController,
  getRestaurantDashboardByRestaurantIdController,
  createCartController,
  createCartItemController,
  deleteCartItemController,
  getCartController,
  deleteCartController,
  checkoutCartController,
  getCartItemsController,
  getAllOrdersWithItemsController,
  getOrderWithItemsByOrderIdController
} from "../controllers/OrderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/order", authMiddleware, createOrderController);
router.get("/orders", authMiddleware, getAllOrdersWithItemsController);
router.patch("/cancel-order/:order_id", authMiddleware, cancelOrderController);
router.patch(
  "/complete-order/:order_id",
  authMiddleware,
  completeOrderController
);
router.post(
  "/pay-order-confirmation",
  authMiddleware,
  payOrderConfirmationController
);
router.post("/pay-order", payOrderController);
router.get("/thanks", thanksController);
router.get("/orders/:order_id", authMiddleware, getOrderByIdController);
router.put("/orders/:order_id", updateOrder);
router.get(
  "/orders-by-restaurant",
  authMiddleware,
  getOrdersByRestaurantIdController
);
router.get(
  "/restaurant-dashboard",
  authMiddleware,
  getRestaurantDashboardByRestaurantIdController
);
router.get(
  "/restaurant-order/:order_id",
  authMiddleware,
  getRestaurantOrderController
);
router.get("/check-midtrans-status", checkMidtransStatusController);
router.post("/save-snap-token", saveSnapTokenController);
router.get("/snap/:order_id", getSnapTokenController);
router.delete("/orders/:order_id", deleteOrder);

// router.get("/cart", authMiddleware, getCartsController);
router.get("/cart/:cart_id", authMiddleware, getCartController);
router.post("/cart", authMiddleware, createCartController);
router.delete("/cart/:restaurant_id", authMiddleware, deleteCartController);
router.post("/cart-item", authMiddleware, createCartItemController);
router.get("/cart-item", authMiddleware, getCartItemsController);
router.delete("/cart-item/:menu_id", authMiddleware, deleteCartItemController);
router.post("/checkout-cart/:cart_id", authMiddleware, checkoutCartController);

router.get("/order-items/:order_id", authMiddleware, getOrderWithItemsByOrderIdController);

export default router;
