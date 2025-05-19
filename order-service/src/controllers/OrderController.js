import axios from "axios";
import pool from "../config/dbInit.js";
import {
  cancelOrderService,
  completeOrderService,
  createOrderService,
  deleteOrderService,
  getCompletedOrdersByRestaurantIdService,
  getOrderByIdService,
  getOrdersByRestaurantIdService,
  getSnapTokenService,
  getUserOrdersService,
  payOrderService,
  pendingOrderService,
  saveSnapTokenService,
  updateOrderStatusService,
  createCartService,
  deleteCartExceptionService,
  createCartItemService,
  deleteCartItemServiceByMenuId,
  getCartsService,
  getCartService,
  getCartServiceByRestaurantId,
  getCartItemsService,
  deleteUserCartService,
  createOrderItemService,
  getAllOrdersWithItemsService,
  getOrderItemsByOrderIdService,
} from "../service/orderService.js";
import crypto from "crypto";
import {
  createTransactionService,
  getTransactionByOrderIdService,
} from "../service/transactionService.js";
import logger from "../config/loggerInit.js";

export const createOrderController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Unauthorized access attempt", { userId });
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or invalid token",
      });
    }

    const token = authHeader.split(" ")[1];
    const orderReq = req.body;
    orderReq.orderType = "CHECKOUT";

    if (!orderReq.menuId || !orderReq.quantity) {
      logger.warn("Order creation failed: Missing required fields", { userId });
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (isNaN(orderReq.menuId)) {
      logger.warn("Invalid menuId received", {
        menuId: orderReq.menuId,
        userId,
      });
      return res
        .status(400)
        .json({ success: false, message: "Invalid menuId" });
    }

    orderReq.userId = userId;

    let menuResponse;
    try {
      logger.info("Fetching menu data", { menuId: orderReq.menuId });
      menuResponse = await axios.get(
        `http://localhost:5000/restaurant/menu-by-Id/${orderReq.menuId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      logger.error("Failed to fetch menu data", {
        menuId: orderReq.menuId,
        error: error.message,
      });
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch menu data" });
    }

    let restaurantResponse;
    try {
      const restaurantId = menuResponse.data.menu.restaurant_id;
      logger.info("Fetching restaurant data", { restaurantId });

      restaurantResponse = await axios.get(
        `http://localhost:5000/restaurant/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      logger.error("Failed to fetch restaurant data", { error: error.message });
      return res
        .status(500)
        .json({ success: false, message: "Failed to fetch restaurant data" });
    }

    orderReq.restaurantId = restaurantResponse.data.restaurant.restaurant_id;

    if (restaurantResponse.data.restaurant.owner_id === userId) {
      logger.warn("User attempted to order from their own restaurant", {
        userId,
        restaurantId: orderReq.restaurantId,
      });
      return res.status(403).json({
        success: false,
        message: "You cannot order from your own restaurant",
      });
    }

    try {
      logger.info("Inserting order into database", {
        userId,
        restaurantId: orderReq.restaurantId,
      });
      const order = await createOrderService(orderReq);

      if (!order) {
        logger.error("Failed to create order", { userId });
        return res
          .status(500)
          .json({ success: false, message: "Failed to create order" });
      }

      // Create order item after successfully creating the order
      logger.info("Creating order item", {
        orderId: order.order_id,
        menuId: orderReq.menuId,
        quantity: orderReq.quantity,
      });

      const orderItem = await createOrderItemService(
        order.order_id,
        orderReq.menuId,
        orderReq.quantity
      );

      if (!orderItem) {
        logger.error("Failed to create order item", {
          orderId: order.order_id,
          menuId: orderReq.menuId,
        });

        // Consider whether to roll back the order in case of item creation failure
        // This depends on your specific business requirements
      }

      logger.info("Order and order item created successfully", {
        orderId: order.order_id,
        userId,
      });

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: {
          ...order,
          items: orderItem ? [orderItem] : [],
        },
      });
    } catch (error) {
      logger.error("Database error while creating order", {
        error: error.message,
      });
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  } catch (error) {
    logger.error("Unexpected server error", { error: error.message });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getOrdersController = async (req, res) => {
  try {
    const { userId } = req.user;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.error("Unauthorized: Missing or invalid token");
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or invalid token",
      });
    }

    const token = authHeader.split(" ")[1];

    logger.info("Fetching orders from database...");
    const orders = await getUserOrdersService(userId);

    if (!orders || orders.length === 0) {
      logger.warn("No orders found for user:", userId);
      return res.status(200).json({
        success: true,
        orders: [],
        message: "No orders found",
      });
    }

    logger.info("Fetching menu data for orders...");
    const ordersWithMenu = await Promise.allSettled(
      orders.map(async (order) => {
        try {
          const { data: menuData } = await axios.get(
            `http://localhost:5000/restaurant/menu-by-id/${order.menu_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          return {
            ...order,
            menu: menuData.menu,
            total_price: order.item_quantity * menuData.menu.menu_price,
          };
        } catch (menuError) {
          logger.error(
            `Failed to fetch menu data for menu_id ${order.menu_id}:`,
            menuError.message
          );
          return {
            ...order,
            menu: null,
            total_price: null,
          };
        }
      })
    );

    logger.info("Orders fetched successfully");
    return res.status(200).json({
      success: true,
      orders: ordersWithMenu.map((result) => result.value || result.reason),
    });
  } catch (error) {
    logger.error("Internal server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllOrdersWithItemsController = async (req, res) => {
  try {
    const orders = await getAllOrdersWithItemsService();
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCartController = async (req, res) => {
  const { userId } = req.user;

  try {
    logger.info("Fetching carts from database...");
    const carts = await getCartsService(userId);

    if (!carts || carts.length === 0) {
      logger.warn("Cart is empty for user:", userId);
      return res.status(200).json({
        success: true,
        cart: [],
        message: "Carts is Empty",
      });
    }

    logger.info("Fetching menu data for carts...");
    return res.status(200).json({
      success: true,
      cart: carts,
    });
  } catch (error) {
    logger.error("Internal server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createCartController = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { restaurantId } = req.body;

    if (role !== "user") {
      logger.warn("Unauthorized access attempt");
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a cart",
      });
    }

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "restaurantId are required",
      });
    }

    logger.info(
      `Clearing previous carts for user ${userId} and restaurant ${restaurantId}...`
    );
    await deleteCartExceptionService(userId, restaurantId);
    logger.info("Previous cart cleared successfully");

    logger.info(
      `Creating cart for user ${userId} and restaurant ${restaurantId}...`
    );
    const cartItem = await createCartService(userId, restaurantId);
    if (!cartItem) {
      const existingCart = await getCartServiceByRestaurantId(
        userId,
        restaurantId
      );
      if (!existingCart) {
        logger.error("Failed to create cart");
        return res.status(500).json({
          success: false,
          message: "Failed to create cart",
        });
      }
      logger.info("Cart already exists, using existing cart");
      return res.status(200).json({
        success: true,
        message: "Cart already exists",
        cartItem: existingCart,
      });
    }
    logger.info(`Cart created: ${cartItem?.cart_id}...`);

    return res.status(201).json({
      success: true,
      message: "Add cart successfully",
      cartItem,
    });
  } catch (error) {
    logger.error("Internal server error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCartController = async (req, res) => {
  const { userId, role } = req.user;
  const { restaurant_id } = req.params;
  try {
    if (role !== "user") {
      logger.warn("Unauthorized access attempt");
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete a cart",
      });
    }

    if (!restaurant_id) {
      logger.warn("Restaurant ID is required");
      return res.status(400).json({
        success: false,
        message: "restaurant_id are required",
      });
    }

    logger.info(
      `Deleting cart for user ${userId} and restaurant ${restaurant_id}...`
    );
    const deletedCart = await deleteCartExceptionService(userId, restaurant_id);
    if (!deletedCart) {
      logger.warn("Cart not found for user:", userId);
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    logger.info(`Cart deleted: ${deletedCart?.cart_id}...`);
    return res.status(200).json({
      success: true,
      message: "Cart deleted successfully",
    });
  } catch (error) {
    logger.error("Internal server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createCartItemController = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { cartId, menuId, quantity, note } = req.body;
    console.log("req.body", req.body);
    if (role !== "user") {
      logger.warn("Unauthorized access attempt");
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a cart",
      });
    }

    const cart = await getCartService(cartId, userId);
    if (!cart) {
      logger.warn("Cart not found for user:", userId);
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    if (cart.user_id !== userId) {
      logger.warn("Unauthorized access attempt to cart", { userId, cartId });
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a cart item",
      });
    }

    if (!cartId || !menuId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "cartId, menuId, and quantity are required",
      });
    }

    logger.info(`Creating cart item for user ${userId} and cart ${cartId}...`);
    const cartItem = await createCartItemService(
      cartId,
      menuId,
      quantity,
      note
    );

    logger.info(`Cart item created: ${cartItem?.cart_item_id}...`);

    return res.status(201).json({
      success: true,
      message: "Add cart item successfully",
      cartItem,
    });
  } catch (error) {
    logger.error("Internal server error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCartItemController = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { menu_id } = req.params;

    if (role !== "user") {
      logger.warn("Unauthorized access attempt");
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a cart",
      });
    }

    if (!menu_id) {
      return res.status(400).json({
        success: false,
        message: "menu_id are required",
      });
    }

    logger.info(
      `Deleting cart item for user ${userId} and menu id ${menu_id}...`
    );
    const cartItem = await deleteCartItemServiceByMenuId(menu_id);

    if (!cartItem) {
      logger.warn(`Cart item ${menu_id} not found`);
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    logger.info(`Cart item deleted: ${cartItem?.cart_item_id}...`);

    return res.status(201).json({
      success: true,
      message: "Deleting cart item successfully",
      cartItem,
    });
  } catch (error) {
    logger.error("Internal server error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const cancelOrderController = async (req, res) => {
  try {
    const { userId } = req.user;
    const order_id = req.params.order_id;

    if (!order_id || isNaN(order_id)) {
      logger.error("Invalid order_id provided");
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    logger.info(`Fetching order ${order_id} from database...`);
    const order = await getOrderByIdService(order_id);

    if (!order) {
      logger.warn(`Order ${order_id} not found`);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user_id !== userId) {
      logger.warn(
        `Unauthorized access attempt by user ${userId} on order ${order_id}`
      );
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }

    if (order.status === "Cancelled") {
      logger.warn(`Order ${order_id} is already cancelled`);
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (order.status !== "Waiting") {
      logger.warn(
        `Order ${order_id} cannot be cancelled (Current status: ${order.status})`
      );
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    logger.info(`Cancelling order ${order_id}...`);
    const result = await cancelOrderService(order_id);

    if (!result) {
      logger.error(`Failed to cancel order ${order_id}`);
      return res.status(500).json({
        success: false,
        message: "Failed to cancel order",
      });
    }

    logger.info(`Order ${order_id} cancelled successfully`);
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    logger.error("Internal server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const completeOrderController = async (req, res) => {
  try {
    const { userId } = req.user;
    const order_id = req.params.order_id;

    if (!order_id || isNaN(order_id)) {
      logger.error("Invalid order_id provided");
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    logger.info(`Fetching order ${order_id}...`);
    const order = await getOrderByIdService(order_id);

    if (!order) {
      logger.warn(`Order ${order_id} not found`);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let restaurant;
    try {
      logger.info(`Fetching restaurant ${order.restaurant_id}...`);
      const response = await axios.get(
        `http://localhost:5000/restaurant/restaurant/${order.restaurant_id}`,
        {
          headers: {
            Authorization: req.headers.authorization,
            "Content-Type": "application/json",
          },
        }
      );
      restaurant = response.data.restaurant;
    } catch (err) {
      logger.error(
        `Failed to fetch restaurant ${order.restaurant_id}: ${err.message}`
      );
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (restaurant.owner_id !== userId) {
      logger.warn(
        `Unauthorized access attempt by user ${userId} on order ${order_id}`
      );
      return res.status(403).json({
        success: false,
        message: "You are not authorized to complete this order",
      });
    }

    if (order.status === "Completed") {
      logger.warn(`Order ${order_id} is already completed`);
      return res.status(400).json({
        success: false,
        message: "Order is already completed",
      });
    }

    if (order.status !== "Preparing") {
      logger.warn(
        `Order ${order_id} cannot be completed (Current status: ${order.status})`
      );
      return res.status(400).json({
        success: false,
        message: "Order cannot be completed",
      });
    }

    logger.info(`Completing order ${order_id}...`);
    const result = await completeOrderService(order_id);

    if (!result) {
      logger.error(`Failed to complete order ${order_id}`);
      return res.status(500).json({
        success: false,
        message: "Failed to complete order",
      });
    }

    logger.info(`Order ${order_id} completed successfully`);
    return res.status(200).json({
      success: true,
      message: "Order completed successfully",
    });
  } catch (error) {
    logger.error("Internal server error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrderByIdController = async (req, res) => {
  const { userId } = req.user;
  const { order_id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const result = await getOrderByIdService(order_id);

    if (!result) {
      logger.warn(`Order ${order_id} not found`);
      return res.status(404).json({
        error: "Order Not Found",
      });
    }

    if (result.user_id !== userId) {
      logger.warn(
        `Unauthorized access attempt by user ${userId} on order ${order_id}`
      );
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    if (result.order_type === "CHECKOUT") {
      // For CHECKOUT type, fetch single menu
      const menu = await axios.get(
        `http://localhost:5000/restaurant/menu-by-id/${result.menu_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const order = {
        ...result,
        menu: menu.data.menu,
      };
      logger.info(`Order ${order_id} fetched successfully`);
      return res.status(200).json({
        success: true,
        order,
      });
    } else if (result.order_type === "CART") {
      const orderItems = await pool.query(
        "SELECT * FROM order_items WHERE order_id = $1",
        [order_id]
      );

      const orderItemsWithMenu = await Promise.all(
        orderItems.rows.map(async (item) => {
          const menu = await axios.get(
            `http://localhost:5000/restaurant/menu-by-id/${item.menu_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          return {
            ...item,
            menu: menu.data.menu,
          };
        })
      );

      const order = {
        ...result,
        items: orderItemsWithMenu,
      };

      logger.info(`Cart order ${order_id} fetched successfully`);
      return res.status(200).json({
        success: true,
        order,
      });
    } else {
      logger.warn(`Invalid order type: ${result.order_type}`);
      return res.status(400).json({
        success: false,
        message: "Invalid order type",
      });
    }
  } catch (error) {
    logger.error("Internal server error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

export const payOrderConfirmationController = async (req, res) => {
  logger.info("PAY ORDER CONFIRMATION CONTROLLER");
  try {
    const { userId } = req.user;
    const { order_id, itemPrice, itemQuantity } = req.body;

    const order = await getOrderByIdService(order_id);
    if (!order) {
      logger.warn(`Order ${order_id} not found`);
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.user_id !== userId) {
      logger.warn(
        `Unauthorized access attempt by user ${userId} on order ${order_id}`
      );
      return res.status(403).json({
        success: false,
        message: "Unauthorized to pay for this order",
      });
    }

    if (order.status !== "Waiting") {
      logger.warn(
        `Order ${order_id} cannot be paid (Current status: ${order.status})`
      );
      return res
        .status(400)
        .json({ success: false, message: "Order cannot be paid" });
    }

    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const base64Auth = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString(
      "base64"
    )}`;
    const response = await axios.post(
      process.env.MIDTRANS_SNAP_URL,
      {
        transaction_details: {
          order_id,
          gross_amount: itemPrice * itemQuantity,
        },
        credit_card: { secure: true },
        isProduction: process.env.IS_PRODUCTION,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: base64Auth,
        },
      }
    );
    logger.info("Payment token generated successfully");
    return res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    logger.error("Error generating payment token:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const payOrderController = async (req, res) => {
  logger.info("PAY ORDER CONTROLLER");
  try {
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    if (!MIDTRANS_SERVER_KEY) {
      logger.error("Server configuration error");
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }
    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
      transaction_time,
      transaction_id,
      payment_type,
      currency,
      expiry_time,
    } = req.body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      logger.warn("Missing required payment information");
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature_key);
    const expectedBuffer = Buffer.from(expectedSignature);

    const isSignatureValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isSignatureValid) {
      logger.warn("Invalid signature key");
      return res
        .status(403)
        .json({ success: false, message: "Invalid signature key" });
    }

    if (transaction_status === "pending") {
      let newTransaction;
      if (payment_type === "bank_transfer") {
        const { va_number, bank } = req.body.va_numbers[0];
        newTransaction = {
          order_id: order_id,
          currency: currency,
          transaction_time: transaction_time,
          expiry_time: expiry_time,
          gross_amount: gross_amount,
          bank: bank,
          va_number: va_number,
          payment_type: payment_type,
          transaction_status: transaction_status,
        };
      } else if (payment_type === "qris") {
        newTransaction = {
          order_id: order_id,
          currency: currency,
          transaction_time: transaction_time,
          expiry_time: expiry_time,
          gross_amount: gross_amount,
          payment_type: payment_type,
          transaction_status: transaction_status,
        };
      }

      await createTransactionService(newTransaction);

      await pendingOrderService(order_id);
    }

    if (transaction_status === "settlement") {
      try {
        const response = await payOrderService(order_id);
        logger.info("Order paid successfully");
        return res.status(200).json({
          success: true,
          message: "Order paid successfully",
          order: response,
        });
      } catch (error) {
        logger.error("Error processing payment:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing payment",
        });
      }
    } else {
      logger.info(`Payment ${transaction_status}`);
      return res.status(200).json({
        success: false,
        message: `Payment ${transaction_status}`,
        order_id,
      });
    }
  } catch (error) {
    logger.error("Internal server error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
    });
  }
};

export const updateOrder = async (req, res) => {
  logger.info("UPDATE ORDER CONTROLLER");
  try {
    const { order_id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "preparing", "delivered"];

    if (!validStatuses.includes(status)) {
      logger.warn("Invalid status value");
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await updateOrderStatusService(order_id, status);
    if (result.rows.length === 0) {
      logger.warn(`Order ${order_id} not found`);
      return res.status(404).json({
        error: "Order Not Found",
      });
    }
    logger.info(`Order ${order_id} updated successfully`);
    return res.json(result.rows[0]);
  } catch (error) {
    logger.error("Internal server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteOrder = async (req, res) => {
  logger.info("DELETE ORDER CONTROLLER");
  try {
    const { order_id } = req.params;
    const result = await deleteOrderService(order_id);

    if (result.rows.length === 0) {
      logger.warn(`Order ${order_id} not found`);
      return res.status(404).json({ error: "Order Not Found" });
    }
    logger.info(`Order ${order_id} deleted successfully`);
    return res.json({ message: "Order deleted successfully" });
  } catch (error) {
    logger.error("Internal server error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const thanksController = async (req, res) => {
  logger.info("THANKS CONTROLLER");
  const { order_id, status_code, transaction_status } = req.query;

  if (!order_id || !status_code || !transaction_status) {
    logger.warn("Missing required parameters");
    return res.status(400).json({ message: "Missing required parameters" });
  }
  logger.info("Redirecting to thanks page");
  return res.redirect(
    `http://localhost:5173/thanks?order_id=${order_id}&status_code=${status_code}&transaction_status=${transaction_status}`
  );
};

export const checkMidtransStatusController = async (req, res) => {
  logger.info("CHECK MIDTRANS STATUS CONTROLLER");
  try {
    const { order_id } = req.query;
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const base64Auth = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString(
      "base64"
    )}`;

    const response = await axios.get(
      `${process.env.MIDTRANS_CHECK_TRANSACTION_URL}/${order_id}/status`,
      {
        headers: { Authorization: base64Auth },
      }
    );
    logger.info("Midtrans status check successful");
    return res.status(200).json(response.data);
  } catch (err) {
    logger.error("Error checking Midtrans status:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const saveSnapTokenController = async (req, res) => {
  logger.info("SAVE SNAP TOKEN CONTROLLER");
  const { order_id, snap_token } = req.body;
  const response = await saveSnapTokenService(order_id, snap_token);
  if (!response) {
    logger.error("Failed to save snap token");
    return res.status(500).json({
      success: false,
      message: "Failed to save snap token",
    });
  }
  logger.info("Snap token saved successfully");
  return res
    .status(200)
    .json({ success: true, message: "Snap token saved successfully" });
};

export const getSnapTokenController = async (req, res) => {
  logger.info("GET SNAP TOKEN CONTROLLER");
  const { order_id } = req.params;
  try {
    const response = await getSnapTokenService(order_id);
    if (!response) {
      logger.warn(`Snap token not found for order ${order_id}`);
      return res.status(404).json({
        success: false,
        message: "Snap token not found",
      });
    }
    logger.info("Snap token fetched successfully");
    return res.status(200).json({
      success: true,
      snap_token: response.snap_token,
    });
  } catch (err) {
    logger.error("Error fetching snap token:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrdersByRestaurantIdController = async (req, res) => {
  logger.info("GET ORDERS BY RESTAURANT ID CONTROLLER");
  const { userId, role } = req.user;
  const token = req.headers.authorization;

  try {
    if (role !== "seller") {
      logger.warn("Unauthorized access attempt by user", { userId });
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these orders",
      });
    }

    const restaurantResponse = await axios.get(
      `http://localhost:5000/restaurant/restaurant`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    const restaurant = restaurantResponse.data.restaurant;
    const restaurant_id = restaurant.restaurant_id;

    if (restaurant.owner_id !== userId) {
      logger.warn("Unauthorized access attempt by user", { userId });
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these orders",
      });
    }

    const orders = await getOrdersByRestaurantIdService(restaurant_id);
    if (orders.length === 0) {
      logger.warn("No orders found");
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          let orderItems = [];
          let menuItems = [];
          let userInfo = null;

          if (order.order_type === "CART") {
            orderItems = await getOrderItemsByOrderIdService(order.order_id);
            
            const menuPromises = orderItems.map(item => 
              axios.get(`http://localhost:5000/restaurant/menu-by-id/${item.menu_id}`, {
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json",
                },
              })
            );
            
            const menuResponses = await Promise.all(menuPromises);
            menuItems = menuResponses.map(response => response.data.menu);
          } else {
            orderItems = [order];
            
            const menuResponse = await axios.get(
              `http://localhost:5000/restaurant/menu-by-id/${order.menu_id}`,
              {
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json",
                },
              }
            );
            
            menuItems = [menuResponse.data.menu];
          }

          const userResponse = await axios.get(
            `http://localhost:5000/user/user/${order.user_id}`,
            {
              headers: {
                Authorization: token,
                "Content-Type": "application/json",
              },
            }
          );
          
          userInfo = userResponse.data.user;
          return {
            ...order,
            items: order.order_type === "CART" ? orderItems : null,
            menu: menuItems,
            user: userInfo,
          };
        } catch (err) {
          logger.error(`Error processing order ${order.order_id}:`, err.message);
          return {
            ...order,
            error: "Failed to fetch complete details for this order",
          };
        }
      })
    );

    logger.info("Orders fetched successfully");
    return res.status(200).json({
      success: true,
      orders: ordersWithDetails,
    });
  } catch (error) {
    logger.error("Error fetching restaurant orders:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

export const getRestaurantDashboardByRestaurantIdController = async (
  req,
  res
) => {
  logger.info("GET RESTAURANT DASHBOARD BY RESTAURANT ID CONTROLLER");
  const { userId, role } = req.user;
  const token = req.headers.authorization;

  try {
    // Verify seller role
    if (role !== "seller") {
      logger.warn("Unauthorized access attempt by user", { userId });
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these orders",
      });
    }

    // Get restaurant details
    const restaurantResponse = await axios.get(
      `http://localhost:5000/restaurant/restaurant`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    const restaurant = restaurantResponse.data.restaurant;
    const restaurant_id = restaurant.restaurant_id;

    // Verify restaurant ownership
    if (restaurant.owner_id !== userId) {
      logger.warn("Unauthorized access attempt by user", { userId });
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these orders",
      });
    }

    const orders = await getCompletedOrdersByRestaurantIdService(restaurant_id);
    if (orders.length === 0) {
      logger.warn("No orders found");
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          let orderItems = [];
          let menuItems = [];
          let userInfo = null;

          if (order.order_type === "CART") {
            orderItems = await getOrderItemsByOrderIdService(order.order_id);

            const menuPromises = orderItems.map(item => 
              axios.get(`http://localhost:5000/restaurant/menu-by-id/${item.menu_id}`, {
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json",
                },
              })
            );
            
            const menuResponses = await Promise.all(menuPromises);
            menuItems = menuResponses.map(response => response.data.menu);
          } else {
            orderItems = [order];
            
            const menuResponse = await axios.get(
              `http://localhost:5000/restaurant/menu-by-id/${order.menu_id}`,
              {
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json",
                },
              }
            );
            
            menuItems = [menuResponse.data.menu];
          }

          const userResponse = await axios.get(
            `http://localhost:5000/user/user/${order.user_id}`,
            {
              headers: {
                Authorization: token,
                "Content-Type": "application/json",
              },
            }
          );
          
          userInfo = userResponse.data.user;

          return {
            ...order,
            items: order.order_type === "CART" ? orderItems : null,
            menu: menuItems,
            user: userInfo,
          };
        } catch (err) {
          logger.error(`Error processing order ${order.order_id}:`, err.message);
          return {
            ...order,
            error: "Failed to fetch complete details for this order",
          };
        }
      })
    );

    logger.info("Orders fetched successfully");
    return res.status(200).json({
      success: true,
      orders: ordersWithDetails,
    });
  } catch (error) {
    logger.error("Error fetching restaurant orders:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

export const getRestaurantOrderController = async (req, res) => {
  logger.info("GET RESTAURANT ORDER CONTROLLER");
  const { role } = req.user;
  const { order_id } = req.params;
  const token = req.headers.authorization;

  if (role !== "seller") {
    logger.warn("Unauthorized access attempt by user");
    return res.status(403).json({
      success: false,
      message: "You are not authorized to view this order",
    });
  }

  if (!order_id) {
    logger.warn("Missing order_id");
    return res.status(400).json({
      success: false,
      message: "Missing order_id",
    });
  }

  try {
    const order = await getOrderByIdService(order_id);
    if (!order) {
      logger.warn("Order not found");
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let ordersInfo = [];
    let menu = [];

    if (order.order_type === "CART") {
      ordersInfo = await getOrderItemsByOrderIdService(order.order_id);
      
      const menuPromises = ordersInfo.map(item => 
        axios.get(`http://localhost:5000/restaurant/menu-by-id/${item.menu_id}`, {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })
      );
      
      const menuResponses = await Promise.all(menuPromises);
      menu = menuResponses.map(response => response.data.menu);
      
    } else {
      ordersInfo = order;
      
      const menuResponse = await axios.get(
        `http://localhost:5000/restaurant/menu-by-id/${order.menu_id}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      
      menu.push(menuResponse.data.menu);
    }

    logger.info("Order items and menu fetched");
    
    const restaurantId = order.restaurant_id;
    const isAuthorized = menu.some(menuItem => menuItem.restaurant_id === restaurantId);
    
    if (!isAuthorized) {
      logger.warn("Unauthorized access attempt by user");
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    const userResponse = await axios.get(
      `http://localhost:5000/user/user/${order.user_id}`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!userResponse || !userResponse.data || !userResponse.data.user) {
      logger.warn("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const transaction = await getTransactionByOrderIdService(order_id);
    if (!transaction) {
      logger.warn("Transaction not found");
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    logger.info("Order fetched successfully");
    return res.status(200).json({
      success: true,
      order: {
        ...order,
        menu,
        user: userResponse.data.user,
        transaction,
      },
    });
    
  } catch (err) {
    logger.error("Error fetching order:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCartItemsController = async (req, res) => {
  logger.info("GET CART ITEMS CONTROLLER");
  const { userId, role } = req.user;

  if (role !== "user") {
    logger.warn("Unauthorized access attempt by user");
    return res.status(403).json({
      success: false,
      message: "You are not authorized to view this order",
    });
  }

  try {
    const carts = await getCartsService(userId);
    if (!carts || carts.length === 0) {
      logger.warn("Carts not found");
      return res.status(404).json({
        success: false,
        cart: [],
        message: "Carts is Empty",
      });
    }

    const cartItems = await getCartItemsService(carts[0].cart_id);
    if (!cartItems || cartItems.length === 0) {
      logger.warn("Cart items not found");
      return res.status(404).json({
        success: false,
        cart: [],
        message: "Cart is Empty",
      });
    }
    const groupedCartItems = cartItems.reduce((acc, item) => {
      const { cart_id, menu_id, quantity } = item;
      const key = `${cart_id}-${menu_id}`;
      if (!acc[key]) {
        acc[key] = {
          cart_id,
          cart_item_id: item.cart_item_id,
          menu_id,
          total_quantity: 0,
          note: item.note || "",
          created_at: item.created_at,
          updated_at: item.updated_at,
          menu: item.menu || null,
        };
      }

      acc[key].total_quantity += quantity;
      return acc;
    }, {});

    const finalCartItems = Object.values(groupedCartItems);

    logger.info("Cart items fetched successfully");

    const cartItemsWithMenu = await Promise.all(
      finalCartItems.map(async (item) => {
        try {
          const response = await axios.get(
            `http://localhost:5000/restaurant/menu-by-id/${item.menu_id}`,
            {
              headers: {
                Authorization: req.headers.authorization,
                "Content-Type": "application/json",
              },
            }
          );

          return {
            ...item,
            menu: response.data.menu,
          };
        } catch (err) {
          logger.error(
            `Failed to fetch menu for menu_id ${item.menu_id}:`,
            err.message
          );
          return {
            ...item,
            menu: null,
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      cartItems: cartItemsWithMenu,
    });
  } catch (err) {
    logger.error("Error fetching cart items:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const checkoutCartController = async (req, res) => {
  logger.info("CHECKOUT CART CONTROLLER");
  const { userId, role } = req.user;
  const { cart_id } = req.params;

  if (role !== "user") {
    logger.warn("Unauthorized access attempt by user");
    return res.status(403).json({
      success: false,
      message: "You are not authorized to view this order",
    });
  }

  if (!cart_id) {
    logger.warn("Missing cart_id");
    return res.status(400).json({
      success: false,
      message: "Missing cart_id",
    });
  }
  try {
    const cart = await getCartService(cart_id, userId);
    if (!cart) {
      logger.warn("Cart not found");
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const cartItems = await getCartItemsService(cart_id);
    console.log("cartItems", cartItems);

    const groupedCartItems = cartItems.reduce((acc, item) => {
      const { cart_id, quantity, menu_id } = item;
      const key = `${cart_id}-${menu_id}`;

      if (!acc[key]) {
        acc[key] = {
          cart_id,
          menu_id,
          total_quantity: 0,
        };
      }

      acc[key].total_quantity += quantity;
      return acc;
    }, {});

    const finalCartItems = Object.values(groupedCartItems);
    console.log("finalCartItems", finalCartItems);
    logger.info("Creating order from cart id:", cart_id);
    const order = await createOrderService({
      userId: userId,
      restaurantId: cart.restaurant_id,
      orderType: "CART",
    });
    if (!order) {
      logger.error("Failed to create order from cart");
      return res.status(500).json({
        success: false,
        message: "Failed to create order from cart",
      });
    }

    await Promise.all(
      finalCartItems.map((item) =>
        createOrderItemService(
          order.order_id,
          item.menu_id,
          item.total_quantity
        )
      )
    );
    logger.info("Order items created successfully");

    logger.info("Resetting cart");
    await deleteUserCartService(userId);

    logger.info("Order created successfully:", order);
    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      order: order,
    });
  } catch (err) {
    logger.error("Error fetching cart:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
