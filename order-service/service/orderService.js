import pool from "../config/db.js";

const createOrderService = async(order) => {
    const result = await pool.query(
        "INSERT INTO orders (user_id, menu_id, restaurant_id, item_quantity) VALUES ($1, $2, $3, $4) RETURNING *",
        [order.userId, order.menuId, order.restaurantId, order.quantity]
    );
    return result.rows[0];
}

const getUserOrdersService = async(userId) => {
    const result = await pool.query(
        "SELECT * FROM orders WHERE user_id = $1",
        [userId]
    );
    return result.rows;
}

const getOrderByIdService = async(orderId) => {
    const result = await pool.query(
        "SELECT * FROM orders WHERE order_id = $1",
        [orderId]
    );
    return result.rows[0];
}

const getOrdersByRestaurantIdService = async(restaurantId) => {
    const result = await pool.query(
        "SELECT * FROM orders WHERE restaurant_id = $1 AND status = 'Preparing'",
        [restaurantId]
    );
    return result.rows;
}

const payOrderService = async(orderId) => {
    const result = await pool.query(
        "update orders set status = 'Preparing' where order_id = $1 RETURNING *",
        [orderId]
    )
    return result.rows[0];
}

const cancelOrderService = async(orderId) => {
    const result = await pool.query(
        "update orders set status = 'Cancelled' where order_id = $1 RETURNING *",
        [orderId]
    )
    return result.rows[0];
}

const pendingOrderService = async(orderId) => {
    const result = await pool.query(
        "update orders set status = 'Pending' where order_id = $1 RETURNING *",
        [orderId]
    )
    return result.rows[0];
}

const saveSnapTokenService = async(orderId, snapToken) => {
    const result = await pool.query(
        "INSERT INTO snaps (order_id, snap_token) VALUES ($1, $2) RETURNING *",
        [orderId, snapToken]
    );
    return result.rows[0];
}

const getSnapTokenService = async(orderId) => {
    const result = await pool.query(
        "SELECT * FROM snaps WHERE order_id = $1",
        [orderId]
    );
    return result.rows[0];
}

export {
    createOrderService,
    getUserOrdersService,
    getOrderByIdService,
    cancelOrderService,
    payOrderService,
    pendingOrderService,
    saveSnapTokenService,
    getSnapTokenService,
    getOrdersByRestaurantIdService
}