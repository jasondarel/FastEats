import pool from "../config/dbInit.js";

const createOrderService = async (order) => {
  const result = await pool.query(
    "INSERT INTO orders (user_id, menu_id, restaurant_id, item_quantity) VALUES ($1, $2, $3, $4) RETURNING *",
    [order.userId, order.menuId, order.restaurantId, order.quantity]
  );
  return result.rows[0];
};

const getUserOrdersService = async (userId) => {
  const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
    userId,
  ]);
  return result.rows;
};

const getOrderByIdService = async (orderId) => {
  const result = await pool.query("SELECT * FROM orders WHERE order_id = $1", [
    orderId,
  ]);
  return result.rows[0];
};

const getOrdersByRestaurantIdService = async (restaurantId) => {
  const result = await pool.query(
    "SELECT * FROM orders WHERE restaurant_id = $1 AND (status = 'Preparing' OR status = 'Completed')",
    [restaurantId]
  );
  return result.rows;
};

export const deleteOrderService = async (orderId) => {
  const result = await pool.query(
    "DELETE FROM orders WHERE order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

export const getCompletedOrdersByRestaurantIdService = async (restaurantId) => {
  const result = await pool.query(
    "SELECT * FROM orders WHERE restaurant_id = $1 AND status = 'Completed'",
    [restaurantId]
  );
  return result.rows;
};

export const updateOrderStatusService = async (orderId, status) => {
  const result = await pool.query(
    "UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *",
    [status, orderId]
  );
  return result.rows[0];
};

const payOrderService = async (orderId) => {
  const result = await pool.query(
    "update orders set status = 'Preparing' where order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

const cancelOrderService = async (orderId) => {
  const result = await pool.query(
    "update orders set status = 'Cancelled' where order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

const completeOrderService = async (orderId) => {
  const result = await pool.query(
    "update orders set status = 'Completed' where order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

const pendingOrderService = async (orderId) => {
  const result = await pool.query(
    "update orders set status = 'Pending' where order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

const saveSnapTokenService = async (orderId, snapToken) => {
  const result = await pool.query(
    "INSERT INTO snaps (order_id, snap_token) VALUES ($1, $2) RETURNING *",
    [orderId, snapToken]
  );
  return result.rows[0];
};

const getSnapTokenService = async (orderId) => {
  const result = await pool.query("SELECT * FROM snaps WHERE order_id = $1", [
    orderId,
  ]);
  return result.rows[0];
};

export const getCartsService = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM carts c
    WHERE c.user_id = $1`,
    [userId]
  );

  return result.rows;
};

export const getCartService = async (cartId, userId) => {
  const result = await pool.query(
    `SELECT * FROM carts c
    WHERE c.cart_id = $1 AND c.user_id = $2`,
    [cartId, userId]
  );
  return result.rows[0];
};

export const getCartServiceByRestaurantId = async (userId, restaurantId) => {
  const result = await pool.query(
    `SELECT * FROM carts c
    WHERE c.user_id = $1 AND c.restaurant_id = $2`,
    [userId, restaurantId]
  );
  return result.rows[0];
};

export const getCartItemsService = async (cartId) => {
  const result = await pool.query(
    `SELECT * FROM cart_items ci
    WHERE ci.cart_id = $1`,
    [cartId]
  );
  return result.rows;
}

export const createCartService = async (userId, restaurantId) => {
  const result = await pool.query(
    `INSERT INTO carts (user_id, restaurant_id, status, created_at, updated_at)
      VALUES ($1, $2, 'active', NOW(), NOW())
        ON CONFLICT (user_id, restaurant_id) DO NOTHING
      RETURNING *`,
    [userId, restaurantId]
  );
  return result.rows[0];
};

export const createCartItemService = async (
  cartId,
  menuId,
  quantity,
  note = ""
) => {
  const result = await pool.query(
    `INSERT INTO cart_items (cart_id, menu_id, quantity, note, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
    [cartId, menuId, quantity, note]
  );
  return result.rows[0];
};

export const deleteCartItemService = async (cartItemId) => {
  const result = await pool.query(
    `DELETE FROM cart_items WHERE cart_item_id = $1 RETURNING *`,
    [cartItemId]
  );
  return result.rows[0];
};

export const deleteCartExceptionService = async (userId, restaurantId) => {
  const result = await pool.query(
    `DELETE FROM carts WHERE user_id = $1 AND restaurant_id != $2 RETURNING *`,
    [userId, restaurantId]
  );
  return result.rows[0];
};

export const deleteUserCartService = async (userId) => {
  const result = await pool.query(
    `DELETE FROM carts WHERE user_id = $1 RETURNING *`,
    [userId]
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
  completeOrderService,
};
