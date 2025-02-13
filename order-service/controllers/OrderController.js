import pool from "../config/db.js";
import axios from "axios";

//create Order
export const createOrder = async (req, res) => {
  try {
    const { user_id, restaurant_id, total_price } = req.body;

    //validasi user id
    let user;
    try {
      const userResponse = await axios.get(
        `https://d86b-61-5-30-124.ngrok-free.app/users/${user_id}`
      );
      user = userResponse.data.user;
    } catch (error) {
      // Tangani jika API restoran mengembalikan 404
      if (error.response && error.response.status === 404) {
        return res.status(404).json({
          status: "error",
          message: "User not Found",
        });
      }
      console.error("❌ Error calling restaurant API:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch User data",
      });
    }

    // Validasi restaurant_id ada di database restoran
    let restaurant;
    try {
      const restaurantResponse = await axios.get(
        `https://4a97-61-5-30-124.ngrok-free.app/restaurant/${restaurant_id}`
      );
      restaurant = restaurantResponse.data.restaurant;
    } catch (error) {
      // Tangani jika API restoran mengembalikan 404
      if (error.response && error.response.status === 404) {
        return res.status(404).json({
          status: "error",
          message: "Restaurant not Found",
        });
      }
      console.error("❌ Error calling restaurant API:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to fetch restaurant data",
      });
    }

    // Insert ke database hanya jika restoran ditemukan
    const result = await pool.query(
      "INSERT INTO orders (user_id, restaurant_id, total_price) VALUES ($1, $2, $3) RETURNING *",
      [user_id, restaurant_id, total_price]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Internal Server Error:", error.message);
    res.status(500).json({
      error: "Internal Server Error",
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
