import axios from "axios";
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
} from "../service/orderService.js";
import crypto from "crypto";
import { createTransactionService, getTransactionByOrderIdService } from "../service/transactionService.js";
import logger from "../config/loggerInit.js";

export const createOrderController = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Unauthorized access attempt", { userId });
      return res.status(401).json({ success: false, message: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const orderReq = req.body;

    if (!orderReq.menuId || !orderReq.quantity) {
      logger.warn("Order creation failed: Missing required fields", { userId });
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (isNaN(orderReq.menuId)) {
      logger.warn("Invalid menuId received", { menuId: orderReq.menuId, userId });
      return res.status(400).json({ success: false, message: "Invalid menuId" });
    }

    orderReq.userId = userId;

    let menuResponse;
    try {
      logger.info("Fetching menu data", { menuId: orderReq.menuId });
      menuResponse = await axios.get(
        `http://localhost:5000/restaurant/menu-by-Id/${orderReq.menuId}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
    } catch (error) {
      logger.error("Failed to fetch menu data", { menuId: orderReq.menuId, error: error.message });
      return res.status(500).json({ success: false, message: "Failed to fetch menu data" });
    }

    let restaurantResponse;
    try {
      const restaurantId = menuResponse.data.menu.restaurant_id;
      logger.info("Fetching restaurant data", { restaurantId });

      restaurantResponse = await axios.get(
        `http://localhost:5000/restaurant/restaurant/${restaurantId}`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
    } catch (error) {
      logger.error("Failed to fetch restaurant data", { error: error.message });
      return res.status(500).json({ success: false, message: "Failed to fetch restaurant data" });
    }

    orderReq.restaurantId = restaurantResponse.data.restaurant.restaurant_id;

    if (restaurantResponse.data.restaurant.owner_id === userId) {
      logger.warn("User attempted to order from their own restaurant", { userId, restaurantId: orderReq.restaurantId });
      return res.status(403).json({ success: false, message: "You cannot order from your own restaurant" });
    }

    try {
      logger.info("Inserting order into database", { userId, restaurantId: orderReq.restaurantId });
      const response = await createOrderService(orderReq);
      
      if (!response) {
        logger.error("Failed to create order", { userId });
        return res.status(500).json({ success: false, message: "Failed to create order" });
      }

      logger.info("Order created successfully", { orderId: response.id, userId });
      return res.status(201).json({ success: true, message: "Order created successfully", order: response });

    } catch (error) {
      logger.error("Database error while creating order", { error: error.message });
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

  } catch (error) {
    logger.error("Unexpected server error", { error: error.message });
    return res.status(500).json({ success: false, message: "Internal server error" });
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
            total_price: order.item_quantity * menuData.menu.menu_price 
          };
        } catch (menuError) {
          logger.error(`Failed to fetch menu data for menu_id ${order.menu_id}:`, menuError.message);
          return { 
            ...order, 
            menu: null, 
            total_price: null 
          };
        }
      })
    );

    logger.info("Orders fetched successfully");
    return res.status(200).json({
      success: true,
      orders: ordersWithMenu.map(result => result.value || result.reason),
    });
  } catch (error) {
    logger.error("Internal server error:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
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
      logger.warn(`Unauthorized access attempt by user ${userId} on order ${order_id}`);
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
      logger.warn(`Order ${order_id} cannot be cancelled (Current status: ${order.status})`);
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
      logger.error(`Failed to fetch restaurant ${order.restaurant_id}: ${err.message}`);
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (restaurant.owner_id !== userId) {
      logger.warn(`Unauthorized access attempt by user ${userId} on order ${order_id}`);
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
      logger.warn(`Order ${order_id} cannot be completed (Current status: ${order.status})`);
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
      logger.warn(`Unauthorized access attempt by user ${userId} on order ${order_id}`);
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

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
      logger.warn(`Unauthorized access attempt by user ${userId} on order ${order_id}`);
      return res.status(403).json({
        success: false,
        message: "Unauthorized to pay for this order",
      });
    }

    if (order.status !== "Waiting") {
      logger.warn(`Order ${order_id} cannot be paid (Current status: ${order.status})`);
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
      message: err.message 
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
      if(payment_type === "bank_transfer") {
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
      } else if(payment_type === "qris") {
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

      await createTransactionService(
        newTransaction
      );

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
        error: "Order Not Found" 
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
    const base64Auth = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64")}`;

    const response = await axios.get(`${process.env.MIDTRANS_CHECK_TRANSACTION_URL}/${order_id}/status`, {
      headers: { Authorization: base64Auth },
    });
    logger.info("Midtrans status check successful");
    return res.status(200).json(response.data);
  } catch (err) {
    logger.error("Error checking Midtrans status:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
}

export const saveSnapTokenController = async (req, res) => {
  logger.info("SAVE SNAP TOKEN CONTROLLER");
  const { order_id, snap_token } = req.body;
  const response = await saveSnapTokenService(order_id, snap_token);
  if (!response) {
    logger.error("Failed to save snap token");
    return res.status(500).json({ 
      success: false, 
      message: "Failed to save snap token" });
  }
  logger.info("Snap token saved successfully");
  return res.status(200).json({ success: true, message: "Snap token saved successfully" });
}

export const getSnapTokenController = async (req, res) => {
  logger.info("GET SNAP TOKEN CONTROLLER");
  const { order_id } = req.params;
  try {
    const response = await getSnapTokenService(order_id);
    if (!response) {
      logger.warn(`Snap token not found for order ${order_id}`);
      return res.status(404).json({ 
        success: false, 
        message: "Snap token not found" 
      });
    }
    logger.info("Snap token fetched successfully");
    return res.status(200).json({ 
      success: true, 
      snap_token: response.snap_token 
    });
  } catch(err) {
    logger.error("Error fetching snap token:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
}

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
    
    const restaurant = await axios.get(
      `http://localhost:5000/restaurant/restaurant`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    
    const restaurant_id = restaurant.data.restaurant.restaurant_id;
    
    if (restaurant.data.restaurant.owner_id !== userId) {
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
        message: "No orders found" 
      });
    }
    
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const menu = await axios.get(
          `http://localhost:5000/restaurant/menu-by-id/${order.menu_id}`,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        
        const user = await axios.get(
          `http://localhost:5000/user/user/${order.user_id}`,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            }
          }
        );
        return {
          ...order,
          menu: menu.data.menu,
          user: user.data.user
        };
      })
    );
    logger.info("Orders fetched successfully");
    return res.status(200).json({
      success: true,
      orders: ordersWithDetails,
    });
    
  } catch (error) {
    logger.error("Error fetching restaurant orders:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve orders", 
      error: error.message 
    });
  }
};

export const getRestaurantDashboardByRestaurantIdController = async (req, res) => {
  logger.info("GET RESTAURANT DASHBOARD BY RESTAURANT ID CONTROLLER");
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
    
    const restaurant = await axios.get(
      `http://localhost:5000/restaurant/restaurant`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    
    const restaurant_id = restaurant.data.restaurant.restaurant_id;
    
    if (restaurant.data.restaurant.owner_id !== userId) {
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
        message: "No orders found" 
      });
    }
    
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const menu = await axios.get(
          `http://localhost:5000/restaurant/menu-by-id/${order.menu_id}`,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        
        const user = await axios.get(
          `http://localhost:5000/user/user/${order.user_id}`,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            }
          }
        );
        return {
          ...order,
          menu: menu.data.menu,
          user: user.data.user
        };
      })
    );
    logger.info("Orders fetched successfully");
    return res.status(200).json({
      success: true,
      orders: ordersWithDetails,
    });
  } catch (error) {
    logger.error("Error fetching restaurant orders:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve orders", 
      error: error.message 
    });
  }
};

export const getRestaurantOrderController = async (req, res) => {
  logger.info("GET RESTAURANT ORDER CONTROLLER");
  const { role } = req.user;
  const {order_id} = req.params;
  const token = req.headers.authorization;

  if(role !== "seller") {
    logger.warn("Unauthorized access attempt by user");
    return res.status(403).json({
      success: false,
      message: "You are not authorized to view this order"
    });
  }

  if(!order_id) {
    logger.warn("Missing order_id");
    return res.status(400).json({
      success: false,
      message: "Missing order_id"
    });
  }

  try {
    const order = await getOrderByIdService(order_id);
    if(!order) {
      logger.warn("Order not found");
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const menu = await axios.get(
      `http://localhost:5000/restaurant/menu-by-id/${order.menu_id}`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    
    if(order.restaurant_id !== menu.data.menu.restaurant_id) {
      logger.warn("Unauthorized access attempt by user");
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order"
      });
    }

    const user = await axios.get(
      `http://localhost:5000/user/user/${order.user_id}`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        }
      }
    );

    const transaction = await getTransactionByOrderIdService(order_id);
    if(!transaction) {
      logger.warn("Transaction not found");
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }

    if(!user) {
      logger.warn("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    logger.info("Order fetched successfully");
    return res.status(200).json({
      success: true,
      order: {
        ...order,
        menu: menu.data.menu,
        user: user.data.user,
        transaction: transaction
      }
    });
  } catch(err) {
    logger.error("Error fetching order:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}