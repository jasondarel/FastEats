import pool from "../config/db.js";
import axios from "axios";

//create Order
export const createOrder = async (req, res) => {
  try {
    const { user_id, restaurant_id, total_price } = req.body;

    // Validasi: Pastikan user_id dan restaurant_id ada di database lain
    //cek id user
    const userResponse = await axios.get(
      `http://user-service/api/users/${user_id}`
    );
    if (!userResponse.data) {
      return res.status(400).json({ error: "User not found" });
    }

    //cek id restaurant
    const restaurantResponse = await axios.get(
      `http://localhost:5003/get-restaurant/${restaurant_id}`
    );
    if (!restaurantResponse.data) {
      return res.status(400).json({ error: "Restaurant not found" });
    }

    const result = await pool.query(
      "INSERT INTO orders (user_id, restaurant_id, total_price) VALUES ($1,$2,$3) RETURNING *",
      [user_id, restaurant_id, total_price]
    );

    //jika valid baru insert
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
