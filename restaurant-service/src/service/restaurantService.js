import axios from "axios";
import pool from "../config/dbInit.js";

export const isRestaurantAvailableByNameId = async (restaurantName, restaurantId) => {
    const result = await pool.query(
        `SELECT 1 FROM restaurants WHERE restaurant_name = $1 AND restaurant_id != $2`,
        [restaurantName, restaurantId]
    );
    return result.rowCount > 0;
};

export const isRestaurantAvailableByName = async (restaurantName) => {
    const result = await pool.query("SELECT 1 FROM restaurants WHERE restaurant_name = $1", [restaurantName]);
    return result.rowCount > 0;
}


export const isRestaurantAvailableById = async (restaurantId) => {
    const result = await pool.query(
        `SELECT 1 FROM restaurants WHERE restaurant_id = $1`,
        [restaurantId]
    );
    return result.rowCount > 0;
};

export const createRestaurantService = async (restaurantReq) => {
    const result = await pool.query(
        `INSERT INTO restaurants (restaurant_name, restaurant_address, owner_id, restaurant_image) 
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [
            restaurantReq.restaurantName,
            restaurantReq.restaurantAddress,
            restaurantReq.ownerId,
            restaurantReq.restaurantImage,
        ]
    );
    
    return result.rows[0];
};


export const updateRestaurantService = async (restaurantReq, id) => {
    const result = await pool.query(
        `UPDATE restaurants 
        SET restaurant_name = $1, restaurant_address = $2, restaurant_image = $3, updated_at = NOW()
        WHERE restaurant_id = $4 
        RETURNING *`,
        [restaurantReq.restaurantName, restaurantReq.restaurantAddress, restaurantReq.restaurantImage, id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

export const deleteRestaurantService = async (id) => {
    const result = await pool.query(
        `DELETE FROM restaurants WHERE restaurant_id = $1 RETURNING *`,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};



export const isOwnerAvailable = async(ownerId) => {
    try {
        const response = await axios.get(`http://localhost:5000/user/is-user-exist/${ownerId}`);
        if(response.data.success) {
            return true;
        }
        return false;
    } catch(err) {
        return false;
    }
}

export const getRestaurantsService = async (ownerId) => {
    try {
        const result = await pool.query(
            "SELECT * FROM restaurants WHERE owner_id != $1",
            [ownerId]
        );
        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching restaurants:", error);
        throw error;
    }
};


export const getRestaurantByOwnerIdService = async (ownerId) => {
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

export const getRestaurantByRestaurantIdService = async (restaurantId) => {
    try {
        // Validasi sebelum query
        if (!restaurantId || isNaN(restaurantId)) {
            throw new Error(`Invalid restaurantId: ${restaurantId}`);
        }

        const result = await pool.query(
            "SELECT * FROM restaurants WHERE restaurant_id = $1",
            [parseInt(restaurantId, 10)]
        );

        return result.rows[0] || null;
    } catch (error) {
        console.error("❌ Error fetching restaurant by restaurant_id:", error);
        throw error;
    }
};


export const getRestaurantService = async (Id) => {
    try {
        const result = await pool.query(
            "SELECT * FROM restaurants WHERE restaurant_id = $1",
            [Id]
        );

        return result.rows[0] || null;
    } catch (error) {
        throw error;
    }
};

export const updateOpenRestaurantService = async (restaurantId, isIopen) => {
    try {
        const result = await pool.query(
            `UPDATE restaurants SET is_open = $1 WHERE restaurant_id = $2 RETURNING *`,
            [isIopen, restaurantId]
        );

        return result.rows[0];
    } catch (error) {
        console.error("❌ Error updating restaurant:", error);
        throw error;
    }
}