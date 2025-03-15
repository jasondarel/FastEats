import pool from "../config/dbInit.js";

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
        "SELECT * FROM orders WHERE restaurant_id = $1 AND (status = 'Preparing' OR status = 'Completed')",
        [restaurantId]
    );
    return result.rows;
}

export const deleteOrderService = async(orderId) => {
    const result = await pool.query(
        "DELETE FROM orders WHERE order_id = $1 RETURNING *",
        [orderId]
    );
    return result.rows[0];
}

export const getCompletedOrdersByRestaurantIdService = async(restaurantId) => {
    const result = await pool.query(
        "SELECT * FROM orders WHERE restaurant_id = $1 AND status = 'Completed'",
        [restaurantId]
    );
    return result.rows;
}

export const updateOrderStatusService = async(orderId, status) => {
    const result = await pool.query(
        "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
        [status, orderId]
    );
    return result.rows[0];
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

const completeOrderService = async(orderId) => {
    const result = await pool.query(
        "update orders set status = 'Completed' where order_id = $1 RETURNING *",
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
    getOrdersByRestaurantIdService,
    completeOrderService
}