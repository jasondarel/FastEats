import pool from "../config/db.js";

const createOrderService = async(order) => {
    const result = await pool.query(
        "INSERT INTO orders (user_id, menu_id, restaurant_id, item_quantity) VALUES ($1, $2, $3, $4) RETURNING *",
        [order.userId, order.menuId, order.restaurantId, order.quantity]
    );
    return result.rows[0];
}

export {
    createOrderService
}