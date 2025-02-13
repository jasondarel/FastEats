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
        [restaurantReq.restaurantName, restaurantReq.restaurantAddress, restaurantReq.ownerId]
    );
    
    return result.rows[0];
};

const updateRestaurantService = async (restaurantReq, id) => {
    const result = await pool.query(
        `UPDATE restaurants 
        SET restaurant_name = $1, restaurant_address = $2, updated_at = NOW()
        WHERE restaurant_id = $3 
        RETURNING *`,
        [restaurantReq.restaurantName, restaurantReq.restaurantAddress, id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

const deleteRestaurantService = async (id) => {
    const result = await pool.query(
        `DELETE FROM restaurants WHERE restaurant_id = $1 RETURNING *`,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};



const isOwnerAvailable = async(ownerId) => {
    // const users = await axios.get("http://localhost:5002/users");
    return ownerId === 1;
}

const getRestaurantsService = async () => {
    try {
        const result = await pool.query("SELECT * FROM restaurants");
        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching restaurants:", error);
        throw error;
    }
};

const getRestaurantByOwnerIdService = async (ownerId) => {
    try {
        const result = await pool.query(
            "SELECT * FROM restaurants WHERE owner_id = $1",
            [ownerId]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error("❌ Error fetching restaurant by owner_id:", error);
        throw error;
    }
};

const getRestaurantService = async (Id) => {
    try {
        const result = await pool.query(
            "SELECT * FROM restaurants WHERE restaurant_id = $1",
            [Id]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error("❌ Error fetching restaurant by restaurant_id:", error);
        throw error;
    }
};



export {
    isRestaurantAvailable,
    getRestaurantsService,
    getRestaurantService,
    getRestaurantByOwnerIdService,
    isOwnerAvailable,
    createRestaurantService,
    updateRestaurantService,
    deleteRestaurantService
};