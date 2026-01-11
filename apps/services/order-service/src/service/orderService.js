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

export const createCartAddsOnCategoryService = async (paramPool=pool, {
  cartItemId,
  categoryName,
  maxSelectable,
  isRequired,
}) => {
  const result = await paramPool.query(
    "INSERT INTO cart_item_adds_on_category (cart_item_id, category_name, max_selectable, is_required) VALUES ($1, $2, $3, $4) RETURNING *",
    [cartItemId, categoryName, maxSelectable, isRequired]
  );
  return result.rows[0];
}

export const getCartAddsOnCategoryService = async (cartItemId) => {
  const result = await pool.query(
    "SELECT * FROM cart_item_adds_on_category WHERE cart_item_id = $1",
    [cartItemId]
  );
  return result.rows;
}

export const getCartAddsOnItemService = async (categoryId) => {
  const result = await pool.query(
    "SELECT * FROM cart_item_adds_on_item WHERE category_id = $1",
    [categoryId]
  );
  return result.rows;
}

export const createCartAddsOnItemService = async (paramPool=pool, {
  categoryId,
  addsOnName,
  addsOnPrice,
}) => {
  const result = await paramPool.query(
    "INSERT INTO cart_item_adds_on_item (category_id, adds_on_name, adds_on_price) VALUES ($1, $2, $3) RETURNING *",
    [categoryId, addsOnName, addsOnPrice]
  );
  return result.rows[0];
}

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

export const getOrderAddsOnItemService = async (categoryId) => {
  const result = await pool.query(
    "SELECT * FROM order_items_adds_on_item WHERE category_id = $1",
    [categoryId]
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

export const createCartItemService = async (client=pool, cartId, menuId, quantity, withAddOns, addOnsDataString) => {
  const result = await client.query(
    `INSERT INTO cart_items (cart_id, menu_id, quantity, created_at, updated_at, with_add_ons, add_ons_data)
       VALUES ($1, $2, $3, NOW(), NOW(), $4, $5)
       RETURNING *`,
    [cartId, menuId, quantity, withAddOns, addOnsDataString]
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

export const deleteCartItemServiceByMenuId = async (menu_id, cart_item_id) => {
  const result = await pool.query(
    `DELETE FROM cart_items WHERE menu_id = $1 AND cart_item_id = $2 RETURNING *`,
    [menu_id, cart_item_id]
  );
  return result.rows[0];
};

export const getCartItemServiceByMenuId = async (cartId, menuId, withAddOns, addOnsDataString) => {
  const result = await pool.query(
    `SELECT * FROM cart_items ci
    WHERE ci.cart_id = $1 AND ci.menu_id = $2 AND ci.with_add_ons = $3 AND ci.add_ons_data = $4`,
    [cartId, menuId, withAddOns, addOnsDataString]
  );
  return result.rows[0];
}

export const updateCartItemQuantityServiceByMenuId = async (client=pool, menuId, quantity, withAddOns, addsOnDataString) => {
  const result = await client.query(
    `UPDATE cart_items
     SET quantity = $1, updated_at = NOW()
     WHERE menu_id = $2 AND with_add_ons = $3 AND add_ons_data = $4 
     RETURNING *`,
    [quantity, menuId, withAddOns, addsOnDataString]
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
      WHERE o.seller_id = $1 AND o.status NOT IN ('Waiting', 'Pending', 'Cancelled')`,
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

export const getSellerSummaryService = async(sellerId) => {
  const result = await pool.query(
            `WITH base_orders_items AS (
            SELECT 
                o.order_id,
                o.user_id,
                o.item_quantity,
                o.created_at,
                oi.menu_category,
                oi.menu_name
            FROM public.orders o
            JOIN public.order_items oi ON oi.order_id = o.order_id
            WHERE o.seller_id = $1
              AND o.status NOT IN ('Waiting', 'Pending', 'Cancelled')
        ),
        base_orders_tx AS (
            SELECT 
                o.order_id,
                o.user_id,
                o.item_quantity,
                o.created_at,
                t.transaction_net
            FROM public.orders o
            JOIN public.transactions t ON t.order_id = o.order_id
            WHERE o.seller_id = $1
              AND o.status NOT IN ('Waiting', 'Pending', 'Cancelled')
        ),
        user_orders AS (
            SELECT 
                user_id,
                COUNT(order_id) AS total_orders,
                MAX(item_quantity) AS max_quantity
            FROM base_orders_items
            GROUP BY user_id
            ORDER BY total_orders DESC
            LIMIT 1
        ),
        top_category AS (
            SELECT 
                menu_category,
                COUNT(*) AS total_category_orders
            FROM base_orders_items
            GROUP BY menu_category
            ORDER BY total_category_orders DESC
            LIMIT 1
        ),
        avg_orders_per_day AS (
            SELECT 
                ROUND(AVG(daily_count), 2) AS avg_orders
            FROM (
                SELECT 
                    DATE(created_at) AS order_date,
                    COUNT(*) AS daily_count
                FROM base_orders_items
                GROUP BY DATE(created_at)
            ) sub
        ),
        top_order_hour AS (
            SELECT 
              EXTRACT(HOUR FROM created_at) AS order_hour,
                COUNT(*) AS total_orders_at_hour
            FROM base_orders_items
            GROUP BY order_hour
            ORDER BY total_orders_at_hour DESC
            LIMIT 1
        ),
        top_menu AS (
            SELECT 
                menu_name,
                COUNT(*) AS total_menu_orders
            FROM base_orders_items
            GROUP BY menu_name
            ORDER BY total_menu_orders DESC
            LIMIT 1
        ),
        avg_obtain_revenue AS (
            SELECT ROUND(AVG(transaction_net), 2) AS avg_revenue
            FROM base_orders_tx
        ),
        highest_obtain_revenue AS (
            SELECT MAX(transaction_net) AS highest_revenue
            FROM base_orders_tx
        )
        SELECT 
            uo.user_id AS highest_frequently_order_user,
            uo.total_orders AS highest_frequently_order_user_total_orders,
            uo.max_quantity AS highest_order_quantity,
            tm.menu_name AS highest_frequently_order_menu_name,
            tc.menu_category AS highest_frequently_order_menu_category,
            aopd.avg_orders AS average_orders_per_day,
            toh.order_hour AS most_popular_order_hour,
            toh.total_orders_at_hour AS total_most_popular_order_hour,
            aor.avg_revenue AS average_obtain_revenue,
            hor.highest_revenue AS highest_obtain_revenue
        FROM user_orders uo
        CROSS JOIN top_category tc
        CROSS JOIN avg_orders_per_day aopd
        CROSS JOIN top_order_hour toh
        CROSS JOIN top_menu tm
        CROSS JOIN avg_obtain_revenue aor
        CROSS JOIN highest_obtain_revenue hor;
        `
  , [sellerId]);
  return result.rows[0];
}

export const getSellerOrderSummaryService = async (sellerId) => {
  const result = await pool.query(
    `
    SELECT 
      o.order_id,
      o.user_id,
      o.seller_id,
      o.status,
      o.item_quantity,
      o.created_at,
      t.transaction_net
    FROM public.orders o
    LEFT JOIN public.transactions t ON t.order_id = o.order_id
    WHERE o.seller_id = $1
      AND o.status NOT IN ('Waiting', 'Pending', 'Cancelled')
    `,
    [sellerId]
  );
  return result.rows;
}