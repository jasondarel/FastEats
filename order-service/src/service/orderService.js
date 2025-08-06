import pool from "../config/dbInit.js";
import {
  COMPLETED_ORDER_ROUTING_KEY,
  PREPARING_ORDER_ROUTING_KEY,
} from "../config/rabbitMQInit.js";

export const createOrderService = async (paramPool=pool, order) => {
  console.log("Creating order with data:", order);
  const result = await paramPool.query(
    "INSERT INTO orders (user_id, restaurant_id, item_quantity, order_type, restaurant_name, restaurant_province, restaurant_city, restaurant_district, restaurant_village, restaurant_address, seller_id, restaurant_image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
    [
      order.userId,
      order.restaurantId,
      order.quantity,
      order.orderType,
      order.restaurantName,
      order.restaurantProvince,
      order.restaurantCity,
      order.restaurantDistrict,
      order.restaurantVillage,
      order.restaurantAddress,
      order.sellerId,
      order.restaurantImage,
    ]
  );
  return result.rows[0];
};

export const createOrderItemService = async (paramPool=pool, orderId, orderReq) => {
  const result = await paramPool.query(
    "INSERT INTO order_items (order_id, menu_id, item_quantity, menu_name, menu_description, menu_price, menu_image, menu_category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
    [
      orderId, 
      orderReq.menuId, 
      orderReq.quantity,
      orderReq.menuName,
      orderReq.menuDescription,
      orderReq.menuPrice,
      orderReq.menuImage,
      orderReq.menuCategory,
    ]
  );
  return result.rows[0];
};

export const createOrderAddsOnCategoryService = async (paramPool=pool, {
  orderItemId,
  categoryName,
  maxSelectable,
  isRequired,
}) => {
  const result = await paramPool.query(
    "INSERT INTO order_items_adds_on_category (order_item_id, category_name, max_selectable, is_required) VALUES ($1, $2, $3, $4) RETURNING *",
    [orderItemId, categoryName, maxSelectable, isRequired]
  );
  return result.rows[0];
}

export const createOrderAddsOnItemService = async (paramPool=pool, {
  addsOnName,
  addsOnPrice,
  categoryId
}) => {
  const result = await paramPool.query(
    "INSERT INTO order_items_adds_on_item (adds_on_name, adds_on_price, category_id) VALUES ($1, $2, $3) RETURNING *",
    [addsOnName, addsOnPrice, categoryId]
  );
  return result.rows[0];
}

export const getOrderAddsOnCategoryService = async (orderItemId) => {
  const result = await pool.query(
    "SELECT * FROM order_items_adds_on_category WHERE order_item_id = $1",
    [orderItemId]
  );
  return result.rows;
}

export const getUserOrdersService = async (userId) => {
  const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
    userId,
  ]);
  return result.rows;
};

export const getOrderByIdService = async (orderId) => {
  const result = await pool.query("SELECT * FROM orders WHERE order_id = $1", [
    orderId,
  ]);
  return result.rows[0];
};

export const getOrdersByRestaurantIdService = async (restaurantId) => {
  const result = await pool.query(
    "SELECT * FROM orders WHERE restaurant_id = $1 AND (status = 'Preparing' OR status = 'Completed' OR status = 'Delivering')",
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

export const payOrderService = async (orderId) => {
  const result = await pool.query(
    "update orders set status = 'Preparing' where order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

export const cancelOrderService = async (orderId) => {
  const result = await pool.query(
    "update orders set status = 'Cancelled' where order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

export const deliverOrderService = async (orderId) => {
  const result = await pool.query(
    "UPDATE orders SET status = 'Delivering', updated_at = NOW() WHERE order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

export const completeOrderService = async (orderId) => {
  const result = await pool.query(
    "UPDATE orders SET status = 'Completed', updated_at = NOW() WHERE order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

export const getOrderJobsByRoutingKeyService = async (routingKey, status) => {
  const result = await pool.query(
    `SELECT * FROM order_jobs
    WHERE routing_key = $1 AND status = $2
    ORDER BY created_at DESC`,
    [routingKey, status]
  );
  return result.rows;
};

export const updateOrderJobStatusService = async (jobId, status) => {
  const result = await pool.query(
    `UPDATE order_jobs
    SET status = $1, updated_at = NOW()
    WHERE id = $2 RETURNING *`,
    [status, jobId]
  );
  return result.rows[0];
};

export const createPreparingOrderJobService = async (payload) => {
  const result = await pool.query(
    `INSERT INTO order_jobs (payload, routing_key)
    VALUES ($1, $2) RETURNING *`,
    [payload, PREPARING_ORDER_ROUTING_KEY]
  );
  return result.rows[0];
};

export const createCompletedOrderJobService = async (payload) => {
  const result = await pool.query(
    `INSERT INTO order_jobs (payload, routing_key)
    VALUES ($1, $2) RETURNING *`,
    [payload, COMPLETED_ORDER_ROUTING_KEY]
  );
  return result.rows[0];
};

export const pendingOrderService = async (orderId) => {
  const result = await pool.query(
    "update orders set status = 'Pending' where order_id = $1 RETURNING *",
    [orderId]
  );
  return result.rows[0];
};

export const saveSnapTokenService = async (orderId, snapToken) => {
  const result = await pool.query(
    "INSERT INTO snaps (order_id, snap_token) VALUES ($1, $2) RETURNING *",
    [orderId, snapToken]
  );
  return result.rows[0];
};

export const getSnapTokenService = async (orderId) => {
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
};

export const createCartService = async (userId, restaurantId) => {
  const result = await pool.query(
    `INSERT INTO carts (user_id, restaurant_id, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (user_id, restaurant_id) DO NOTHING
      RETURNING *`,
    [userId, restaurantId]
  );
  return result.rows[0];
};

export const createCartItemService = async (cartId, menuId, quantity) => {
  const result = await pool.query(
    `INSERT INTO cart_items (cart_id, menu_id, quantity, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
    [cartId, menuId, quantity]
  );
  return result.rows[0];
};

export const deleteCartItemServiceByCartItemId = async (cartItemId) => {
  const result = await pool.query(
    `DELETE FROM cart_items WHERE cart_item_id = $1 RETURNING *`,
    [cartItemId]
  );
  return result.rows[0];
};

export const deleteCartItemServiceByMenuId = async (menu_id) => {
  const result = await pool.query(
    `DELETE FROM cart_items WHERE menu_id = $1 RETURNING *`,
    [menu_id]
  );
  return result.rows[0];
};

export const getCartItemServiceByMenuId = async (cartId, menuId) => {
  const result = await pool.query(
    `SELECT * FROM cart_items ci
    WHERE ci.cart_id = $1 AND ci.menu_id = $2`,
    [cartId, menuId]
  );
  return result.rows[0];
}

export const updateCartItemQuantityServiceByMenuId = async (menuId, quantity) => {
  const result = await pool.query(
    `UPDATE cart_items
     SET quantity = $1, updated_at = NOW()
     WHERE menu_id = $2 RETURNING *`,
    [quantity, menuId]
  );
  return result.rows[0];
}

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
};

export const getOrderItemsByOrderIdService = async (orderId) => {
  const result = await pool.query(
    `SELECT * FROM order_items oi
    WHERE oi.order_id = $1`,
    [orderId]
  );
  return result.rows;
};

export const getOrdersBySellerIdService = async (sellerId, status) => {
  let result
  if (status === "") {
    result = await pool.query(
      `SELECT * FROM orders o
      WHERE o.seller_id = $1 AND o.status NOT IN ('Pending', 'Cancelled')`,
      [sellerId]
    );
  } else {
    result = await pool.query(
      `SELECT * FROM orders o
      WHERE o.seller_id = $1 AND o.status = $2`,
      [sellerId, status]
    );
  }
  return result.rows;
}

export const getAllOrdersWithItemsService = async ({userId}) => {
  const result = await pool.query(
    `SELECT 
    o.order_id,
    o.user_id,
    o.restaurant_id,
    o.status,
    o.order_type,
    o.created_at,
    o.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'order_item_id', oi.order_item_id,
                'menu_id', oi.menu_id,
                'item_quantity', oi.item_quantity
            )
        ) FILTER (WHERE oi.order_item_id IS NOT NULL),
        '[]'
    ) AS items
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.user_id = $1
GROUP BY o.order_id
ORDER BY o.created_at DESC;
`, [userId]
  );
  return result.rows;
};

export const getAllOrderWithItemsByOrderIdService = async (orderId) => {
  const result = await pool.query(
    `SELECT 
      o.*, 
      COALESCE(
        json_agg(
          json_build_object(
            'order_item_id', oi.order_item_id,
            'menu_id', oi.menu_id,
            'item_quantity', oi.item_quantity,
            'menu_name', oi.menu_name,
            'menu_description', oi.menu_description,
            'menu_price', oi.menu_price,
            'menu_image', oi.menu_image,
            'menu_category', oi.menu_category
          )
        ) FILTER (WHERE oi.order_item_id IS NOT NULL),
        '[]'
      ) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_id = $1
    GROUP BY o.order_id
    ORDER BY o.created_at DESC;`,
    [orderId]
  );
  const rawOrder = result.rows[0];
  return rawOrder;
};
