import pool from "../config/db.js";
import axios from "axios";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { menuId, quantity } = req.body;

    if (!menuId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    if (isNaN(menuId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurantId or menuId",
      });
    }

    console.log("Fetching restaurant data...");
    const restaurantResponse = await axios.get(
      `http://localhost:5000/restaurant/restaurant/${restaurantId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing or invalid token",
      });
    }
    const token = authHeader.split(" ")[1];

    console.log("Fetching menu data...");
    const menuResponse = await axios.get(
      `http://localhost:5000/restaurant/menu-by-Id/${menuId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Simpan order ke database
    console.log("Inserting order into database...");
    const result = await pool.query(
      "INSERT INTO orders (user_id, menu_id, restaurant_id, total_price) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, menuId, restaurantResponse.data.restaurant.restaurant_id, quantity]
    );

    res.status(201).json({
      success: true,
      order: result.rows[0],
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("❌ Internal Server Error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    // Tangani error umum
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//getall
export const getOrder = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const { order_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM orders WHERE  order_id = $1",
      [order_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order Not Found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Update Order
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
