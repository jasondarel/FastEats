import { getMenuByRestaurantIdService } from "../../restaurant-service/src/service/menuService.js";
import pool from "../config/db.js";
import axios from "axios";
import {
  cancelOrderService,
  completeOrderService,
  createOrderService,
  getOrderByIdService,
  getOrdersByRestaurantIdService,
  getSnapTokenService,
  getUserOrdersService,
  payOrderService,
  pendingOrderService,
  saveSnapTokenService,
} from "../service/orderService.js";
import crypto from "crypto";
import { createTransactionService, getTransactionByOrderIdService } from "../service/transactionService.js";

export const createOrderController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or invalid token",
      });
    }
    const token = authHeader.split(" ")[1];

    const orderReq = req.body;
    orderReq.userId = userId;
    console.log(orderReq);
    if (!orderReq.menuId || !orderReq.quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    if (isNaN(orderReq.menuId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurantId or menuId",
      });
    }

    const menuResponse = await axios.get(
      `http://localhost:5000/restaurant/menu-by-Id/${orderReq.menuId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Fetching restaurant data...");
    const restaurantResponse = await axios.get(
      `http://localhost:5000/restaurant/restaurant/${menuResponse.data.menu.restaurant_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    orderReq.restaurantId = restaurantResponse.data.restaurant.restaurant_id;

    if (restaurantResponse.data.restaurant.owner_id === userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot order from your own restaurant",
      });
    }
    console.log("Fetching menu data...");

    console.log("Inserting order into database...");
    const response = await createOrderService(orderReq);
    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Failed to create order",
      });
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: response,
    });
  } catch (error) {
    console.error("❌ Internal Server Error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrdersController = async (req, res) => {
  const { userId } = req.user;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const orders = await getUserOrdersService(userId);
    if (orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    const ordersWithMenu = await Promise.all(
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
          const totalPrice = order.item_quantity * menuData.menu.menu_price;
          return { ...order, menu: menuData, total_price: totalPrice };
        } catch (menuError) {
          return {
            ...order,
            menu: null,
            total_price: null,
            menuError: "Failed to fetch menu data",
          };
        }
      })
    );
    return res.status(200).json({
      success: true,
      orders: ordersWithMenu,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrderController = async (req, res) => {
  const { userId } = req.user;
  const order_id = req.params.order_id;

  const order = await getOrderByIdService(order_id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to cancel this order",
    });
  }

  if (order.status === "Cancelled") {
    return res.status(400).json({
      success: false,
      message: "Order is already cancelled",
    });
  }

  if (order.status !== "Waiting") {
    return res.status(400).json({
      success: false,
      message: "Order cannot be cancelled",
    });
  }

  const result = await cancelOrderService(order_id);
  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
  });
};
export const completeOrderController = async (req, res) => {
  const { userId } = req.user;
  const order_id = req.params.order_id;
  const order = await getOrderByIdService(order_id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  const restaurant = await axios.get(
    `http://localhost:5000/restaurant/restaurant/${order.restaurant_id}`,
    {
      headers: {
        Authorization: req.headers.authorization,
        "Content-Type": "application/json",
      },
    }
  )

  if(!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found"
    });
  }

  if (restaurant.data.restaurant.owner_id !== userId) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to cancel this order",
    });
  }

  if(order.status === "Completed") {
    return res.status(400).json({
      success: false,
      message: "Order is already completed"
    });
  }

  if (order.status !== "Preparing") {
    return res.status(400).json({
      success: false,
      message: "Order cannot be Completed",
    });
  }

  const result = await completeOrderService(order_id);
  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Order Completed successfully",
  });
};

export const getOrderByIdController = async (req, res) => {
  const { userId } = req.user;
  const { order_id } = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const result = await getOrderByIdService(order_id);

    if (!result) {
      return res.status(404).json({
        error: "Order Not Found",
      });
    }

    if (result.user_id !== userId) {
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

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const payOrderConfirmationController = async (req, res) => {
  console.log("Received payment confirmation:", req.body);
  try {
    const { userId } = req.user;
    const { order_id, itemPrice, itemQuantity } = req.body;

    const order = await getOrderByIdService(order_id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to pay for this order",
      });
    }

    if (order.status !== "Waiting") {
      return res
        .status(400)
        .json({ success: false, message: "Order cannot be paid" });
    }

    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const base64Auth = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString(
      "base64"
    )}`;
    console.log("Sending payment request to Midtrans...");
    console.log("Bae64Auth:", base64Auth);
    const response = await axios.post(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      {
        transaction_details: {
          order_id,
          gross_amount: itemPrice * itemQuantity,
        },
        credit_card: { secure: true },
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: base64Auth,
        },
      }
    );
    console.log("Payment response:", response.data);
    return res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    console.error(err.response.data);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const payOrderController = async (req, res) => {
  try {
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

    if (!MIDTRANS_SERVER_KEY) {
      console.error(
        "MIDTRANS_SERVER_KEY is not defined in environment variables"
      );
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }
    console.log("Received payment notification:", req.body);
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
      console.log("Missing required fields in payment notification");
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

      const transactionResponse = await createTransactionService(
        newTransaction
      );

      const orderResponse = await pendingOrderService(order_id);
    }

    if (transaction_status === "settlement") {
      try {
        const response = await payOrderService(order_id);
        console.log("Order paid successfully:", order_id);
        return res.status(200).json({
          success: true,
          message: "Order paid successfully",
          order: response,
        });
      } catch (error) {
        console.error("Error processing payment for order:", order_id, error);
        return res.status(500).json({
          success: false,
          message: "Error processing payment",
        });
      }
    } else {
      console.log(
        `Order payment status: ${transaction_status} for order: ${order_id}`
      );
      return res.status(200).json({
        success: false,
        message: `Payment ${transaction_status}`,
        order_id,
      });
    }
  } catch (error) {
    console.error("Unexpected error in payment controller:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred",
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "preparing", "delivered"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
      [status, order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order Not Found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const result = await pool.query(
      "DELETE FROM orders WHERE order_id = $1 RETURNING *",
      [order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order Not Found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const thanksController = async (req, res) => {
  const { order_id, status_code, transaction_status } = req.query;

  if (!order_id || !status_code || !transaction_status) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  res.redirect(
    `http://localhost:5173/thanks?order_id=${order_id}&status_code=${status_code}&transaction_status=${transaction_status}`
  );
};

export const checkMidtransStatusController = async (req, res) => {
  try {
    const { order_id } = req.query;
    
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const base64Auth = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64")}`;

    const response = await axios.get(`https://api.sandbox.midtrans.com/v2/${order_id}/status`, {
      headers: { Authorization: base64Auth },
    });

    return res.status(200).json(response.data);
  } catch (err) {
    console.error("Midtrans status check error:", err.response?.data || err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export const saveSnapTokenController = async (req, res) => {
  const { order_id, snap_token } = req.body;
  const response = await saveSnapTokenService(order_id, snap_token);
  if (!response) {
    return res.status(500).json({ success: false, message: "Failed to save snap token" });
  }
  return res.status(200).json({ success: true, message: "Snap token saved successfully" });
}

export const getSnapTokenController = async (req, res) => {
  const { order_id } = req.params;
  try {
    const response = await getSnapTokenService(order_id);
    if (!response) {
      return res.status(404).json({ success: false, message: "Snap token not found" });
    }
    return res.status(200).json({ success: true, snap_token: response.snap_token });
  } catch(err) {

  }
}

export const getOrdersByRestaurantIdController = async (req, res) => {
  const { userId, role } = req.user;
  const token = req.headers.authorization;

  try {
    // Check user role
    if (role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these orders",
      });
    }
    
    // Get restaurant information
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
    
    // Verify restaurant ownership
    if (restaurant.data.restaurant.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these orders",
      });
    }
    
    // Get orders for the restaurant
    const orders = await getOrdersByRestaurantIdService(restaurant_id);
    
    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No orders found" 
      });
    }
    
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        // Get menu details
        const menu = await axios.get(
          `http://localhost:5000/restaurant/menu-by-id/${order.menu_id}`,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        
        // Get user details
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
    
    console.log("Orders with details:", ordersWithDetails);

    return res.status(200).json({
      success: true,
      orders: ordersWithDetails,
    });
    
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to retrieve orders", 
      error: error.message 
    });
  }
};

export const getRestaurantOrderController = async (req, res) => {
  const { userId, role } = req.user;
  const {order_id} = req.params;
  const token = req.headers.authorization;

  if(role !== "seller") {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to view this order"
    });
  }

  if(!order_id) {
    return res.status(400).json({
      success: false,
      message: "Missing order_id"
    });
  }

  try {
    const order = await getOrderByIdService(order_id);
    if(!order) {
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

    }

    console.log("User:", user);
    console.log("Menu:", menu);

    if(!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

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

  }
}