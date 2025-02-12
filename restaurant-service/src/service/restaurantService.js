import axios from "axios";
import pool from "../config/dbInit.js";

const isRestaurantAvailable = async (restaurantName) => {
    const result = await pool.query(
        `SELECT 1 FROM restaurants WHERE restaurant_name = $1`,
        [restaurantName]
    );
    return result.rowCount > 0;
};

const createRestaurantService = async (restaurantReq) => {
    const result = await pool.query(
        `INSERT INTO restaurants (restaurant_name, restaurant_address, owner_id) 
        VALUES ($1, $2, $3) RETURNING *`,
        [restaurantReq.restaurantName, restaurantReq.restaurantAddress, restaurantReq.owner_id]
    );
    
    return result.rows[0];
};

const isOwnerAvailable = async(ownerId) => {
    const users = await axios.get("http://localhost:5002/users");
}

export {
    isRestaurantAvailable,
    createRestaurantService
};