import envInit from "../config/envInit.js";
envInit();
import axios from "axios";
import pool from "../config/dbInit.js";
import {
  cancelOrderService,
  completeOrderService,
  deliverOrderService,
  createOrderService,
  deleteOrderService,
  getOrderByIdService,
  getOrdersByRestaurantIdService,
  getSnapTokenService,
  getUserOrdersService,
  payOrderService,
  pendingOrderService,
  saveSnapTokenService,
  updateOrderStatusService,
  createCartService,
  deleteCartExceptionService,
  createCartItemService,
  deleteCartItemServiceByMenuId,
  getCartsService,
  getCartService,
  getCartServiceByRestaurantId,
  getCartItemsService,
  deleteUserCartService,
  createOrderItemService,
  getAllOrdersWithItemsService,
  getOrderItemsByOrderIdService,
  getAllOrderWithItemsByOrderIdService,
  createPreparingOrderJobService,
  createCompletedOrderJobService,
  updateCartItemQuantityServiceByMenuId,
  getCartItemServiceByMenuId,
  getOrdersBySellerIdService,
  createOrderAddsOnCategoryService,
  createOrderAddsOnItemService,
  getOrderAddsOnCategoryService,
  getOrderAddsOnItemService,
} from "../service/orderService.js";
import crypto from "crypto";
import {
  createTransactionService,
  getTransactionByOrderIdService,
} from "../service/transactionService.js";
import logger from "../config/loggerInit.js";
import { responseSuccess, responseError } from "../util/responseUtil.js";
import { getOrderDetailsInformation } from "../util/orderUtil.js";
import {
  getMenuInformation,
  getRestaurantInformation,
  getUserInformation,
} from "../../../packages/shared/apiService.js";
import { getRedisClient } from "../config/redisInit.js";

const GLOBAL_SERVICE_URL = process.env.GLOBAL_SERVICE_URL;
const CLIENT_URL = process.env.CLIENT_URL;
const internalAPIKey = process.env.INTERNAL_API_KEY;

export const createOrderController = async (req, res) => {
  logger.info("CREATE ORDER CONTROLLER");
  const client = await pool.connect();
  try {
    const userId = req.user?.userId;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Unauthorized access attempt", { userId });
      client.release();
      return responseError(res, 401, "Unauthorized: Missing or invalid token");
    }

    const token = authHeader.split(" ")[1];
    const orderReq = req.body;
    const addsOnData = JSON.parse(orderReq.addsOnData || "[]");
    orderReq.orderType = "CHECKOUT";

    if (!orderReq.menuId || !orderReq.quantity) {
      logger.warn("Order creation failed: Missing required fields", { userId });
      client.release();
      return responseError(res, 400, "Missing required fields");
    }

    if (isNaN(orderReq.menuId)) {
      logger.warn("Invalid menuId received", {
        menuId: orderReq.menuId,
        userId,
      });
      client.release();
      return responseError(res, 400, "Invalid menuId");
    }

    orderReq.userId = userId;

    let menuResponse;
    try {
      logger.info("Fetching menu data", { menuId: orderReq.menuId });
      menuResponse = await axios.get(
        `${GLOBAL_SERVICE_URL}/restaurant/menu-by-Id/${orderReq.menuId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      logger.error("Failed to fetch menu data", {
        menuId: orderReq.menuId,
        error: error.message,
      });
      client.release();
      return responseError(res, 500, "Failed to fetch menu data");
    }

    let restaurantResponse;
    try {
      const restaurantId = menuResponse.data.menu.restaurant_id;
      logger.info("Fetching restaurant data", { restaurantId });

      restaurantResponse = await axios.get(
        `${GLOBAL_SERVICE_URL}/restaurant/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      logger.error("Failed to fetch restaurant data", { error: error.message });
      client.release();
      return responseError(res, 500, "Failed to fetch restaurant data");
    }

    orderReq.restaurantId = restaurantResponse.data.restaurant.restaurant_id;

    if (restaurantResponse.data.restaurant.owner_id === userId) {
      logger.warn("User attempted to order from their own restaurant", {
        userId,
        restaurantId: orderReq.restaurantId,
      });
      client.release();
      return responseError(
        res,
        403,
        "You cannot order from your own restaurant"
      );
    }

    orderReq.restaurantName = restaurantResponse.data.restaurant.restaurant_name;
    orderReq.restaurantProvince = restaurantResponse.data.restaurant.restaurant_province;
    orderReq.restaurantCity = restaurantResponse.data.restaurant.restaurant_city;
    orderReq.restaurantDistrict = restaurantResponse.data.restaurant.restaurant_district;
    orderReq.restaurantVillage = restaurantResponse.data.restaurant.restaurant_village;
    orderReq.sellerId = restaurantResponse.data.restaurant.owner_id;
    orderReq.restaurantAddress = restaurantResponse.data.restaurant.restaurant_address;
    orderReq.restaurantImage = restaurantResponse.data.restaurant.restaurant_image;
    orderReq.menuName = menuResponse.data.menu.menu_name;
    orderReq.menuDescription = menuResponse.data.menu.menu_description;
    orderReq.menuPrice = menuResponse.data.menu.menu_price;
    orderReq.menuImage = menuResponse.data.menu.menu_image;
    orderReq.menuCategory = menuResponse.data.menu.menu_category;

    try {
      await client.query('BEGIN');

      logger.info("Inserting order into database", {
        userId,
        restaurantId: orderReq.restaurantId,
      });
      const order = await createOrderService(client, orderReq);

      if (!order) {
        logger.error("Failed to create order", { userId });
        await client.query('ROLLBACK');
        client.release();
        return responseError(res, 500, "Failed to create order");
      }
      logger.info("Creating order item", {
        orderId: order.order_id,
        menuId: orderReq.menuId,
        quantity: orderReq.quantity,
      });

      const orderItem = await createOrderItemService(
        client,
        order.order_id,
        orderReq
      );

      if (!orderItem) {
        logger.error("Failed to create order item", {
          orderId: order.order_id,
          menuId: orderReq.menuId,
        });
        await client.query('ROLLBACK');
        client.release();
        return responseError(res, 500, "Failed to create order item");
      }

      if (addsOnData) {
        try {
          for (const [key, value] of Object.entries(addsOnData)) {
            if (Array.isArray(value)) {
              const addOnItemCategory = await createOrderAddsOnCategoryService(client, {
                orderItemId: orderItem.order_item_id,
                categoryName: key,
                maxSelectable: value[0].max_selectable,
                isRequired: value[0].is_required || false,
              });
              
              if (!addOnItemCategory) {
                logger.error("Failed to create add-on category for order item", {
                  orderItemId: orderItem.order_item_id,
                  categoryName: key,
                });
                throw new Error(`Failed to create add-on category: ${key}`);
              }
              
              for (const item of value) {
                const addOnItem = await createOrderAddsOnItemService(client, {
                  addsOnName: item.item_name,
                  addsOnPrice: item.item_price,
                  categoryId: addOnItemCategory.category_id,
                });
                
                if (!addOnItem) {
                  logger.error("Failed to create add-on item for order item", {
                    orderItemId: orderItem.order_item_id,
                    addsOnName: item.item_name,
                  });
                  throw new Error(`Failed to create add-on item: ${item.item_name}`);
                }
              }
            } else if (value !== null) {
              const addOnItemCategory = await createOrderAddsOnCategoryService(client, {
                orderItemId: orderItem.order_item_id,
                categoryName: key,
                maxSelectable: value.max_selectable || 1,
                isRequired: value.is_required || false,
              });
              
              if (!addOnItemCategory) {
                logger.error("Failed to create add-on category for order item", {
                  orderItemId: orderItem.order_item_id,
                  categoryName: key,
                });
                throw new Error(`Failed to create add-on category: ${key}`);
              }
              
              const addOnItem = await createOrderAddsOnItemService(client, {
                addsOnName: value.item_name,
                addsOnPrice: value.item_price,
                categoryId: addOnItemCategory.category_id,
              });
              
              if (!addOnItem) {
                logger.error("Failed to create add-on item for order item", {
                  orderItemId: orderItem.order_item_id,
                  addsOnName: value.item_name,
                });
                throw new Error(`Failed to create add-on item: ${value.item_name}`);
              }
            }
          }
        } catch (addOnError) {
          logger.error("Error creating add-ons", { error: addOnError.message });
          await client.query('ROLLBACK');
          client.release();
          return responseError(res, 500, `Failed to create add-ons: ${addOnError.message}`);
        }
      }

      await client.query('COMMIT');
      logger.info("Order and order item created successfully", {
        orderId: order.order_id,
        userId,
      });

      client.release();
      return responseSuccess(res, 201, "Order created successfully", "order", {
        ...order,
        items: orderItem ? [orderItem] : [],
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      logger.error("Database error while creating order", {
        error: error.message,
      });
      return responseError(res, 500, "Database error while creating order");
    }
  } catch (error) {
    logger.error("Internal server error", { error: error.message });
    return responseError(res, 500, "Internal server error");
  }
};

export const getOrdersController = async (req, res) => {
  logger.info("GET ORDERS CONTROLLER");
  try {
    const { userId } = req.user;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.error("Unauthorized: Missing or invalid token");
      return responseError(res, 401, "Unauthorized: Missing or invalid token");
    }

    const token = authHeader.split(" ")[1];

    logger.info("Fetching orders from database...");
    const orders = await getUserOrdersService(userId);

    if (!orders || orders.length === 0) {
      logger.warn("No orders found for user:", userId);
      return responseSuccess(res, 200, "No orders found", "orders", []);
    }

    logger.info("Fetching menu data for orders...");
    const ordersWithMenu = await Promise.allSettled(
      orders.map(async (order) => {
        try {
          const { data: menuData } = await axios.get(
            `${GLOBAL_SERVICE_URL}/restaurant/menu-by-id/${order.menu_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          return {
            ...order,
            menu: menuData.menu,
            total_price: order.item_quantity * menuData.menu.menu_price,
          };
        } catch (menuError) {
          logger.error(
            `Failed to fetch menu data for menu_id ${order.menu_id}:`,
            menuError.message
          );
          return {
            ...order,
            menu: null,
            total_price: null,
          };
        }
      })
    );

    logger.info("Orders fetched successfully");
    return responseSuccess(
      res,
      200,
      "Orders fetched successfully",
      "orders",
      ordersWithMenu.map((result) => result.value || result.reason)
    );
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const getAllOrdersWithItemsController = async (req, res) => {
  logger.info("GET ALL ORDERS WITH ITEMS CONTROLLER");
  const { userId, role } = req.user;
  try {
    const orders = await getAllOrdersWithItemsService({userId});
    return responseSuccess(
      res,
      200,
      "Orders fetched successfully",
      "data",
      orders
    );
  } catch (error) {
    logger.error("Error fetching orders:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const getOrderWithItemsByOrderIdController = async (req, res) => {
  logger.info("GET ORDER WITH ITEMS BY ORDER ID CONTROLLER");
  const { order_id } = req.params;
  const { userId, role } = req.user;

  try {
    const order = await getAllOrderWithItemsByOrderIdService(order_id);
    if (!order) {
      logger.warn("Order not found:", order_id);
      return responseError(res, 404, "Order not found");
    }

    let totalAddonPrice = 0;
    
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        logger.info(`Processing addons for item: ${item.order_item_id}`);
        
        const orderItemAddsOnCategory = await getOrderAddsOnCategoryService(item.order_item_id);
        logger.info(`Addon categories found: ${orderItemAddsOnCategory?.length || 0}`);
        
        if (orderItemAddsOnCategory && orderItemAddsOnCategory.length > 0) {
          for (const category of orderItemAddsOnCategory) {
            const addOnItems = await getOrderAddsOnItemService(category.category_id);
            logger.info(`Addon items in category ${category.category_id}: ${addOnItems?.length || 0}`);
            
            if (addOnItems && addOnItems.length > 0) {
              const categoryAddonPrice = addOnItems.reduce((sum, addon) => {
                const price = parseFloat(addon.adds_on_price) || 0;
                const quantity = addon.quantity || 1;
                const itemTotal = price * quantity;
                
                logger.info(`Addon item: ${addon.adds_on_name}, Price: ${price}, Qty: ${quantity}, Total: ${itemTotal}`);
                return sum + itemTotal;
              }, 0);
              
              logger.info(`Category ${category.category_name} addon total: ${categoryAddonPrice}`);
              totalAddonPrice += categoryAddonPrice;
            }
          }
        }
      }
    }
    
    logger.info(`Final total addon price: ${totalAddonPrice}`);

    const orderWithAddons = {
      ...order,
      addon_price: totalAddonPrice
    };

    logger.info("Fetching menu data for order items...");
    return responseSuccess(
      res,
      200,
      "Order fetched successfully",
      "order",
      orderWithAddons
    );
  } catch (err) {
    logger.error("Error fetching order with items:", err);
    return responseError(res, 500, "Internal server error");
  }
};

export const getCartController = async (req, res) => {
  logger.info("GET CART CONTROLLER");
  const { userId } = req.user;

  try {
    logger.info("Fetching carts from database...");
    const carts = await getCartsService(userId);

    if (!carts || carts.length === 0) {
      logger.warn("Cart is empty for user:", userId);
      return responseSuccess(res, 200, "Carts is Empty", "cart", []);
    }

    logger.info("Fetching menu data for carts...");
    return responseSuccess(
      res,
      200,
      "Carts fetched successfully",
      "cart",
      carts
    );
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const createCartController = async (req, res) => {
  logger.info("CREATE CART CONTROLLER");
  try {
    const { userId, role } = req.user;
    const { restaurantId } = req.body;

    if (role !== "user") {
      logger.warn("Unauthorized access attempt");
      return responseError(res, 403, "You are not authorized to create a cart");
    }

    if (!restaurantId) {
      return responseError(res, 400, "restaurantId are required");
    }

    logger.info(
      `Clearing previous carts for user ${userId} and restaurant ${restaurantId}...`
    );
    await deleteCartExceptionService(userId, restaurantId);
    logger.info("Previous cart cleared successfully");

    logger.info(
      `Creating cart for user ${userId} and restaurant ${restaurantId}...`
    );
    const cartItem = await createCartService(userId, restaurantId);
    if (!cartItem) {
      const existingCart = await getCartServiceByRestaurantId(
        userId,
        restaurantId
      );
      if (!existingCart) {
        logger.error("Failed to create cart");
        return responseError(res, 500, "Failed to create cart");
      }
      logger.info("Cart already exists, using existing cart");
      return responseSuccess(
        res,
        200,
        "Cart already exists",
        "cartItem",
        existingCart
      );
    }
    logger.info(`Cart created: ${cartItem?.cart_id}...`);

    return responseSuccess(
      res,
      201,
      "Add cart successfully",
      "cartItem",
      cartItem
    );
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const deleteCartController = async (req, res) => {
  logger.info("DELETE CART CONTROLLER");
  const { userId, role } = req.user;
  const { restaurant_id } = req.params;
  try {
    if (role !== "user") {
      logger.warn("Unauthorized access attempt");
      return responseError(res, 403, "You are not authorized to delete a cart");
    }

    if (!restaurant_id) {
      logger.warn("Restaurant ID is required");
      return responseError(res, 400, "restaurant_id are required");
    }

    logger.info(
      `Deleting cart for user ${userId} and restaurant ${restaurant_id}...`
    );
    const deletedCart = await deleteCartExceptionService(userId, restaurant_id);
    if (!deletedCart) {
      logger.warn("Cart not found for user:", userId);
      return responseError(res, 404, "Cart not found");
    }
    logger.info(`Cart deleted: ${deletedCart?.cart_id}...`);
    return responseSuccess(res, 200, "Cart deleted successfully");
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const updateCartItemQuantityController = async (req, res) => {
  logger.info("UPDATE CART ITEM QUANTITY CONTROLLER");
  try {
    const { userId, role } = req.user;
    const { menu_id } = req.params;
    const { quantity } = req.body;

    if (role !== "user") {
      logger.warn("Unauthorized access attempt");
      return responseError(res, 403, "You are not authorized to update a cart item");
    }

    if (!menu_id || !quantity) {
      return responseError(res, 400, "menu_id and quantity are required");
    }

    logger.info(
      `Updating cart item for user ${userId} and menu id ${menu_id} with quantity ${quantity}...`
    );
    const updatedCartItem = await updateCartItemQuantityServiceByMenuId(menu_id, quantity);
    
    if (!updatedCartItem) {
      logger.warn(`Cart item ${menu_id} not found`);
      return responseError(res, 404, "Cart item not found");
    }

    logger.info(`Cart item updated: ${updatedCartItem?.cart_item_id}...`);

    return responseSuccess(
      res,
      200,
      "Cart item updated successfully",
      "cartItem",
      updatedCartItem
    );
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
}

export const createCartItemController = async (req, res) => {
  logger.info("CREATE CART ITEM CONTROLLER");
  try {
    const { userId, role } = req.user;
    const { cartId, menuId, quantity, note } = req.body;

    if (role !== "user") {
      logger.warn("Unauthorized access attempt");
      return responseError(res, 403, "You are not authorized to create a cart");
    }

    const cart = await getCartService(cartId, userId);
    if (!cart) {
      logger.warn("Cart not found for user:", userId);
      return responseError(res, 404, "Cart not found");
    }

    if (cart.user_id !== userId) {
      logger.warn("Unauthorized access attempt to cart", { userId, cartId });
      return responseError(
        res,
        403,
        "You are not authorized to create a cart item"
      );
    }

    if (!cartId || !menuId || !quantity) {
      return responseError(
        res,
        400,
        "cartId, menuId, and quantity are required"
      );
    }

    const existedCartItem = await getCartItemServiceByMenuId(cartId, menuId);
    if (existedCartItem) {
      logger.warn("Cart item already exists", {
        userId,
        cartId,
        menuId,
      });
      const updatedQuantity = Number(existedCartItem.quantity) + Number(quantity);
      const updatedCartItem = await updateCartItemQuantityServiceByMenuId(menuId, updatedQuantity);
      logger.info("Cart item quantity updated successfully");
      return responseSuccess(
        res,
        200,
        "Cart item already exists, quantity updated",
        "cartItem",
        updatedCartItem
      );
    }

    logger.info(`Creating cart item for user ${userId} and cart ${cartId}...`);
    const cartItem = await createCartItemService(
      cartId,
      menuId,
      quantity,
      note
    );

    logger.info(`Cart item created: ${cartItem?.cart_item_id}...`);

    return responseSuccess(
      res,
      201,
      "Add cart item successfully",
      "cartItem",
      cartItem
    );
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const deleteCartItemController = async (req, res) => {
  logger.info("DELETE CART ITEM CONTROLLER");
  try {
    const { userId, role } = req.user;
    const { menu_id } = req.params;
    console.log("Menu ID:", menu_id);

    if (role !== "user") {
      logger.warn("Unauthorized access attempt");
      return responseError(res, 403, "You are not authorized to create a cart");
    }

    if (!menu_id) {
      return responseError(res, 400, "menu_id are required");
    }

    logger.info(
      `Deleting cart item for user ${userId} and menu id ${menu_id}...`
    );
    const cartItem = await deleteCartItemServiceByMenuId(menu_id);
    console.log("Cart Item:", cartItem);

    if (!cartItem) {
      logger.warn(`Cart item ${menu_id} not found`);
      return responseError(res, 404, "Cart item not found");
    }

    logger.info(`Cart item deleted: ${cartItem?.cart_item_id}...`);

    return responseSuccess(
      res,
      201,
      "Deleting cart item successfully",
      "cartItem",
      cartItem
    );
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const cancelOrderController = async (req, res) => {
  logger.info("CANCEL ORDER CONTROLLER");
  try {
    const { userId } = req.user;
    const order_id = req.params.order_id;

    if (!order_id || isNaN(order_id)) {
      logger.error("Invalid order_id provided");
      return responseError(res, 400, "Invalid order ID");
    }

    logger.info(`Fetching order ${order_id} from database...`);
    const order = await getOrderByIdService(order_id);

    if (!order) {
      logger.warn(`Order ${order_id} not found`);
      return responseError(res, 404, "Order not found");
    }

    if (order.user_id !== userId) {
      logger.warn(
        `Unauthorized access attempt by user ${userId} on order ${order_id}`
      );
      return responseError(
        res,
        403,
        "You are not authorized to cancel this order"
      );
    }

    if (order.status === "Cancelled") {
      logger.warn(`Order ${order_id} is already cancelled`);
      return responseError(res, 400, "Order is already cancelled");
    }

    if (order.status !== "Waiting") {
      logger.warn(
        `Order ${order_id} cannot be cancelled (Current status: ${order.status})`
      );
      return responseError(res, 400, "Order cannot be cancelled");
    }

    logger.info(`Cancelling order ${order_id}...`);
    const result = await cancelOrderService(order_id);

    if (!result) {
      logger.error(`Failed to cancel order ${order_id}`);
      return responseError(res, 500, "Failed to cancel order");
    }

    logger.info(`Order ${order_id} cancelled successfully`);
    return responseSuccess(res, 200, "Order cancelled successfully");
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const deliverOrderController = async (req, res) => {
  logger.info("DELIVER ORDER CONTROLLER");
  try {
    const { userId } = req.user;
    const order_id = req.params.order_id;
    const token = req.headers.authorization?.split(" ")[1];

    if (!order_id || isNaN(order_id)) {
      logger.error("Invalid order_id provided");
      return responseError(res, 400, "Invalid order ID");
    }

    logger.info(`Fetching order ${order_id}...`);
    const order = await getAllOrderWithItemsByOrderIdService(order_id);
    if (!order) {
      logger.warn(`Order ${order_id} not found`);
      return responseError(res, 404, "Order not found");
    }

    const restaurantResponse = await getRestaurantInformation(
      GLOBAL_SERVICE_URL,
      order.restaurant_id,
      token,
      `Restaurant with ID ${order.restaurant_id} not found`
    );

    if (!restaurantResponse?.restaurant) {
      logger.warn(`Restaurant with ID ${order.restaurant_id} not found`);
      return responseError(res, 404, "Restaurant not found");
    }
    const restaurant = restaurantResponse.restaurant;

    if (restaurant.owner_id !== userId) {
      logger.warn(
        `Unauthorized access attempt by user ${userId} on order ${order_id}`
      );
      return responseError(
        res,
        403,
        "You are not authorized to deliver this order"
      );
    }

    if (order.status === "Delivering") {
      logger.warn(`Order ${order_id} is already being delivered`);
      return responseError(res, 400, "Order is already being delivered");
    }

    if (order.status !== "Preparing") {
      logger.warn(
        `Order ${order_id} cannot be delivered (Current status: ${order.status})`
      );
      return responseError(
        res,
        400,
        "Order cannot be delivered from current status"
      );
    }

    logger.info(`Setting order ${order_id} to delivering...`);
    const result = await deliverOrderService(order_id);
    if (!result) {
      logger.error(`Failed to set order ${order_id} to delivering`);
      return responseError(res, 500, "Failed to set order to delivering");
    }

    logger.info(`Order ${order_id} is now being delivered`);
    const updatedOrder = await getAllOrderWithItemsByOrderIdService(order_id);

    const io = req.app.get("io");
    io.emit("orderDelivering", {
      order_id: updatedOrder.order_id,
      status: updatedOrder.status,
      delivering_at: new Date(),
    });

    return responseSuccess(res, 200, "Order is now being delivered");
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const completeOrderController = async (req, res) => {
  logger.info("COMPLETE ORDER CONTROLLER");
  try {
    const { userId } = req.user;
    const order_id = req.params.order_id;

    if (!order_id || isNaN(order_id)) {
      logger.error("Invalid order_id provided");
      return responseError(res, 400, "Invalid order ID");
    }

    logger.info(`Fetching order ${order_id}...`);
    const order = await getAllOrderWithItemsByOrderIdService(order_id);
    if (!order) {
      logger.warn(`Order ${order_id} not found`);
      return responseError(res, 404, "Order not found");
    }

    if (order.user_id !== userId) {
      logger.warn(
        `Unauthorized access attempt by user ${userId} on order ${order_id}. Order belongs to user ${order.user_id}`
      );
      return responseError(
        res,
        403,
        "You are not authorized to complete this order"
      );
    }

    if (order.status === "Completed") {
      logger.warn(`Order ${order_id} is already completed`);
      return responseError(res, 400, "Order is already completed");
    }

    if (order.status !== "Delivering") {
      logger.warn(
        `Order ${order_id} cannot be completed (Current status: ${order.status})`
      );
      return responseError(
        res,
        400,
        "Order must be in 'Delivering' status to be completed"
      );
    }

    logger.info(`Completing order ${order_id}...`);
    const result = await completeOrderService(order_id);
    if (!result) {
      logger.error(`Failed to complete order ${order_id}`);
      return responseError(res, 500, "Failed to complete order");
    }

    logger.info(`Order ${order_id} completed successfully`);
    const updatedOrder = await getAllOrderWithItemsByOrderIdService(order_id);

    const io = req.app.get("io");
    io.emit("orderCompleted", {
      order_id: updatedOrder.order_id,
      status: updatedOrder.status,
      completed_at: new Date(),
    });

    const restaurantResponse = await getRestaurantInformation(
      GLOBAL_SERVICE_URL,
      order.restaurant_id,
      internalAPIKey,
      `Restaurant with ID ${order.restaurant_id} not found`
    );

    if (!restaurantResponse?.restaurant) {
      logger.warn(`Restaurant with ID ${order.restaurant_id} not found`);
      return responseError(res, 500, "Restaurant information not available");
    }
    const restaurant = restaurantResponse.restaurant;

    const [ownerResult, customerResult] = await Promise.all([
      getUserInformation(
        GLOBAL_SERVICE_URL,
        restaurant.owner_id,
        internalAPIKey,
        `Owner with ID ${restaurant.owner_id} not found`
      ),
      getUserInformation(
        GLOBAL_SERVICE_URL,
        updatedOrder.user_id,
        internalAPIKey,
        `Customer with ID ${updatedOrder.user_id} not found`
      ),
    ]);

    if (!ownerResult?.user) {
      logger.warn(`Owner not found for user ${restaurant.owner_id}`);
      return responseError(res, 500, "Owner information not available");
    }

    if (!customerResult?.user) {
      logger.warn(`Customer not found for user ${updatedOrder.user_id}`);
      return responseError(res, 500, "Customer information not available");
    }

    const itemsWithMenuDetails = await Promise.all(
      updatedOrder.items.map(async (item) => {
        try {
          const menuResponse = await getMenuInformation(
            GLOBAL_SERVICE_URL,
            item.menu_id,
            internalAPIKey,
            `Menu with ID ${item.menu_id} not found`
          );

          const menu = menuResponse.menu;
          return {
            ...item,
            menu_name: menu?.name || menu?.menu_name || `Menu #${item.menu_id}`,
            menu_description: menu?.menu_description || "",
            menu_price: menu?.menu_price || 0,
            menu_image: menu?.image || menu?.menu_image || "",
            menu_category: menu?.category || "",
          };
        } catch (error) {
          logger.error(
            `Failed to fetch menu details for menu_id ${item.menu_id}:`,
            error.message
          );
          return {
            ...item,
            menu_name: `Menu #${item.menu_id}`,
            menu_description: "Menu details unavailable",
            menu_price: 0,
            menu_image: "",
            menu_category: "Unknown",
          };
        }
      })
    );

    const orderDetails = {
      order_id: updatedOrder.order_id,
      restaurant_name: restaurant.restaurant_name,
      customer_name: customerResult.user.name,
      owner_name: ownerResult.user.name,
      owner_email: ownerResult.user.email,
      customer_email: customerResult.user.email,
      total_price: updatedOrder.total_price,
      completed_at: new Date(),
      order: { ...updatedOrder, items: itemsWithMenuDetails },
    };

    await createCompletedOrderJobService(orderDetails);

    return responseSuccess(res, 200, "Order completed successfully", "order", orderDetails);
  } catch (error) {
    logger.error("Internal server error", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const getOrderByIdController = async (req, res) => {
  logger.info("GET ORDER BY ID CONTROLLER");
  const { userId, role } = req.user;
  const { order_id } = req.params;

  try {
    const result = await getOrderByIdService(order_id);

    if (!result) {
      logger.warn(`Order ${order_id} not found`);
      return responseError(res, 404, "Order Not Found");
    }

    if (role === "user") {
        if (result.user_id !== userId) {
          logger.warn(
            `Unauthorized access attempt by user ${userId} on order ${order_id}`
          );
        }
      } else if (role === "seller") {
        if (result.seller_id !== userId) {
          logger.warn(
            `Unauthorized access attempt by seller ${userId} on order ${order_id}`
          );
        }
      }

    if (result.order_type === "CHECKOUT") {
      const orderItems = await getOrderItemsByOrderIdService(result.order_id);
      if (!orderItems || orderItems.length === 0) {
        logger.warn(`No items found for order ${order_id}`);
        return responseError(res, 404, "No items found for this order");
      }

      let addsOn = [];

      const orderItemAddsOnCategory = await getOrderAddsOnCategoryService(orderItems[0].order_item_id);
      if (orderItemAddsOnCategory !== null && orderItemAddsOnCategory.length !== 0) {
        addsOn = await Promise.all(
          orderItemAddsOnCategory.map(async (category) => {
            const addOnItems = await getOrderAddsOnItemService(category.category_id);
            return {
              ...category,
              items: addOnItems
            };
          })
        );
      }

      const order = {
        ...result,
        ...orderItems[0],
        addsOn: addsOn,
      };
      logger.info(`Order ${order_id} fetched successfully`);
      return responseSuccess(
        res,
        200,
        "Order fetched successfully",
        "order",
        order
      );
    } else if (result.order_type === "CART") {
      const orderItems = await getOrderItemsByOrderIdService(result.order_id);
      let addsOn = [];
      if (orderItems.length > 0) {
        for (const item of orderItems) {
            const orderItemAddsOnCategory = await getOrderAddsOnCategoryService(item.order_item_id);
            if (orderItemAddsOnCategory !== null && orderItemAddsOnCategory.length !== 0) {
                addsOn = await Promise.all(
                    orderItemAddsOnCategory.map(async (category) => {
                        const addOnItems = await getOrderAddsOnItemService(category.category_id);
                        return {
                            ...category,
                            items: addOnItems
                        };
                    })
                );
            }
        }
      }

      const order = {
        ...result,
        items: orderItems,
        addsOn: addsOn,
      };

      logger.info(`Cart order ${order_id} fetched successfully`);
      return responseSuccess(
        res,
        200,
        "Order fetched successfully",
        "order",
        order
      );
    } else {
      logger.warn(`Invalid order type: ${result.order_type}`);
      return responseError(res, 400, "Invalid order type");
    }
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, error.message);
  }
};

export const payOrderConfirmationController = async (req, res) => {
  logger.info("PAY ORDER CONFIRMATION CONTROLLER");
  try {
    const tax = 2000;
    const { userId } = req.user;
    const {
      order_id,
      itemPrice,
      itemQuantity,
      shipping_province,
      shipping_city,
      shipping_district,
      shipping_village,
      shipping_address,
      shipping_phone,
      shipping_name,
    } = req.body;
    
    const order = await getOrderByIdService(order_id);
    if (!order) {
      logger.warn(`Order ${order_id} not found`);
      return responseError(res, 404, "Order not found");
    }

    if (order.user_id !== userId) {
      logger.warn(
        `Unauthorized access attempt by user ${userId} on order ${order_id}`
      );
      return responseError(
        res,
        403,
        "You are not authorized to pay for this order"
      );
    }

    if (order.status !== "Waiting") {
      logger.warn(
        `Order ${order_id} cannot be paid (Current status: ${order.status})`
      );
      return responseError(res, 400, "Order cannot be paid");
    }

    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const base64Auth = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString(
      "base64"
    )}`;
    const totalPrice = itemPrice + tax;
    const response = await axios.post(
      process.env.MIDTRANS_SNAP_URL,
      {
        transaction_details: {
          order_id,
          gross_amount: totalPrice,
        },
        custom_field1: [
          shipping_province,
          shipping_city,
          shipping_district,
          shipping_village,
          shipping_address,
          shipping_phone,
          shipping_name,
        ],
        custom_field2: [
          tax,
          itemPrice
        ],
        credit_card: { secure: true },
        isProduction: process.env.IS_PRODUCTION,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: base64Auth,
        },
      }
    );
    logger.info("Payment token generated successfully");
    return responseSuccess(
      res,
      200,
      "Payment token generated successfully",
      "data",
      response.data
    );
  } catch (err) {
    logger.error("Error generating payment token:", err);
    return responseError(res, 500, "Error generating payment token");
  }
};

export const payOrderController = async (req, res) => {
  logger.info("PAY ORDER CONTROLLER");
  try {
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    if (!MIDTRANS_SERVER_KEY) {
      logger.error("Server configuration error");
      return responseError(res, 500, "Server configuration error");
    }
    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
      transaction_time,
      transaction_id,
      payment_type,
      currency,
      expiry_time,
      custom_field1,
      custom_field2,
    } = req.body;

    const shippingProvince = JSON.parse(custom_field1)[0];
    const shippingCity = JSON.parse(custom_field1)[1];
    const shippingDistrict = JSON.parse(custom_field1)[2];
    const shippingVillage = JSON.parse(custom_field1)[3];
    const shippingAddress = JSON.parse(custom_field1)[4];
    const shippingPhone = JSON.parse(custom_field1)[5];
    const shippingName = JSON.parse(custom_field1)[6];

    const tax = JSON.parse(custom_field2)[0];
    const transactionNet = JSON.parse(custom_field2)[1];

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      logger.warn("Missing required payment information");
      return responseError(res, 400, "Missing required payment information");
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature_key);
    const expectedBuffer = Buffer.from(expectedSignature);

    const isSignatureValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isSignatureValid) {
      logger.warn("Invalid signature key");
      return responseError(res, 403, "Invalid signature key");
    }

    if (transaction_status === "pending") {
      let newTransaction;
      if (payment_type === "bank_transfer") {
        const { va_number, bank } = req.body.va_numbers[0];
        newTransaction = {
          order_id: order_id,
          currency: currency,
          transaction_time: transaction_time,
          expiry_time: expiry_time,
          gross_amount: gross_amount,
          bank: bank,
          shipping_province: shippingProvince,
          shipping_city: shippingCity,
          shipping_district: shippingDistrict,
          shipping_village: shippingVillage,
          shipping_address: shippingAddress,
          shipping_phone: shippingPhone,
          shipping_name: shippingName,
          va_number: va_number,
          payment_type: payment_type,
          transaction_status: transaction_status,
          transaction_net: transactionNet,
          tax: tax,
        };
      } else if (payment_type === "qris") {
        newTransaction = {
          order_id: order_id,
          currency: currency,
          transaction_time: transaction_time,
          expiry_time: expiry_time,
          gross_amount: gross_amount,
          payment_type: payment_type,
          shipping_province: shippingProvince,
          shipping_city: shippingCity,
          shipping_district: shippingDistrict,
          shipping_village: shippingVillage,
          shipping_address: shippingAddress,
          shipping_phone: shippingPhone,
          shipping_name: shippingName,
          transaction_status: transaction_status,
          transaction_net: transactionNet,
          tax: tax,
        };
      }

      const existingTransaction = await getTransactionByOrderIdService(
        order_id
      );
      if (existingTransaction) {
        await createTransactionService({
          ...newTransaction,
          id: existingTransaction.transaction_id,
        });
      } else {
        await createTransactionService(newTransaction);
      }

      await pendingOrderService(order_id);

      const redisClient = getRedisClient();
      if (!redisClient) {
        logger.error("Redis client not initialized");
        return responseError(res, 500, "Redis client not initialized");
      }
      
      await redisClient.set(
        `order:${order_id}`,
        JSON.stringify({
          order_id: order_id,
          status: "pending",
          transaction_status: transaction_status,
          transaction_time: transaction_time,
          payment_type: payment_type,
          gross_amount: gross_amount,
          shipping_province: shippingProvince,
          shipping_city: shippingCity,
          shipping_district: shippingDistrict,
          shipping_village: shippingVillage,
          shipping_address: shippingAddress,
          shipping_phone: shippingPhone,
          shipping_name: shippingName,
          tax: tax,
          transaction_net: transactionNet,
        }),
        "NX",
        "EX",
        30 * 60
      );
      logger.info(`Order ${order_id} set to pending in Redis`);

      logger.info(`Transaction ${order_id} set to pending`);
      return responseSuccess(
        res,
        200,
        "Transaction pending processed successfully",
        "order_id",
        order_id
      );
    }

    if (transaction_status === "settlement") {
      try {
        const response = await payOrderService(order_id);

        const orderDetailData = await getOrderDetailsInformation(
          order_id,
          internalAPIKey
        );

        const insertPreparingJobsResponse =
          await createPreparingOrderJobService(orderDetailData);

        if (!insertPreparingJobsResponse) {
          logger.error("Failed to create preparing order jobs");
          return responseError(
            res,
            500,
            "Failed to create preparing order jobs"
          );
        }

        const redisClient = getRedisClient();
        if (redisClient) {
          await redisClient.del(`order:${order_id}`);
          logger.info(`Redis key order:${order_id} deleted after payment success`);
        }

        logger.info("Order paid successfully");
        return responseSuccess(
          res,
          200,
          "Order paid successfully",
          "order",
          response
        );
      } catch (error) {
        logger.error("Error processing payment:", error);
        return responseError(res, 500, "Error processing payment");
      }
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      logger.info(`Transaction ${order_id} status: ${transaction_status}`);
      return responseSuccess(
        res,
        200,
        `Transaction ${transaction_status} processed`,
        "order_id",
        order_id
      );
    } else {
      logger.info(
        `Unknown transaction status: ${transaction_status} for order: ${order_id}`
      );
      return responseSuccess(
        res,
        200,
        `Transaction status ${transaction_status} acknowledged`,
        "order_id",
        order_id
      );
    }
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const updateOrder = async (req, res) => {
  logger.info("UPDATE ORDER CONTROLLER");
  try {
    const { order_id } = req.params;
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "preparing",
      "delivered,",
      "Completed",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      logger.warn("Invalid status value");
      return responseError(res, 400, "Invalid status value");
    }

    const result = await updateOrderStatusService(order_id, status);
    if (!result) {
      logger.warn(`Order ${order_id} not found`);
      return responseError(res, 404, "Order Not Found");
    }

    const io = req.app.get("io");

    io.emit("orderUpdated", result);
    logger.info(`Order ${order_id} updated successfully`);
    return responseSuccess(
      res,
      200,
      "Order updated successfully",
      "order",
      result
    );
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const deleteOrder = async (req, res) => {
  logger.info("DELETE ORDER CONTROLLER");
  try {
    const { order_id } = req.params;
    const result = await deleteOrderService(order_id);

    if (result.rows.length === 0) {
      logger.warn(`Order ${order_id} not found`);
      return responseError(res, 404, "Order Not Found");
    }
    logger.info(`Order ${order_id} deleted successfully`);
    return responseSuccess(res, 200, "Order deleted successfully");
  } catch (error) {
    logger.error("Internal server error:", error);
    return responseError(res, 500, "Internal server error");
  }
};

export const thanksController = async (req, res) => {
  logger.info("THANKS CONTROLLER");
  const { order_id, status_code, transaction_status } = req.query;

  if (!order_id || !status_code || !transaction_status) {
    logger.warn("Missing required parameters");
    return responseError(res, 400, "Missing required parameters");
  }
  logger.info("Redirecting to thanks page");
  return res.redirect(
    `${CLIENT_URL}/thanks?order_id=${order_id}&status_code=${status_code}&transaction_status=${transaction_status}`
  );
};

export const checkMidtransStatusController = async (req, res) => {
  logger.info("CHECK MIDTRANS STATUS CONTROLLER");
  try {
    const { order_id } = req.query;
    const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
    const base64Auth = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString(
      "base64"
    )}`;

    const response = await axios.get(
      `${process.env.MIDTRANS_CHECK_TRANSACTION_URL}/${order_id}/status`,
      {
        headers: { Authorization: base64Auth },
      }
    );
    logger.info("Midtrans status check successful");
    return responseSuccess(
      res,
      200,
      "Midtrans status check successful",
      "data",
      response.data
    );
  } catch (err) {
    logger.error("Error checking Midtrans status:", err);
    return responseError(res, 500, err.message);
  }
};

export const saveSnapTokenController = async (req, res) => {
  logger.info("SAVE SNAP TOKEN CONTROLLER");
  const { order_id, snap_token } = req.body;
  const response = await saveSnapTokenService(order_id, snap_token);
  if (!response) {
    logger.error("Failed to save snap token");
    return responseError(res, 500, "Failed to save snap token");
  }
  logger.info("Snap token saved successfully");
  return responseSuccess(
    res,
    201,
    "Snap token saved successfully",
    "snap_token",
    response.snap_token
  );
};

export const getSnapTokenController = async (req, res) => {
  logger.info("GET SNAP TOKEN CONTROLLER");
  const { order_id } = req.params;
  try {
    const response = await getSnapTokenService(order_id);
    if (!response) {
      logger.warn(`Snap token not found for order ${order_id}`);
      return responseError(res, 404, "Snap token not found");
    }
    logger.info("Snap token fetched successfully");
    return responseSuccess(
      res,
      200,
      "Snap token fetched successfully",
      "snap_token",
      response.snap_token
    );
  } catch (err) {
    logger.error("Error fetching snap token:", err);
    return responseError(res, 500, "Internal server error");
  }
};

export const getOrdersByRestaurantIdController = async (req, res) => {
  logger.info("GET ORDERS BY RESTAURANT ID CONTROLLER");
  const { userId, role } = req.user;
  const token = req.headers.authorization;

  try {
    if (role !== "seller") {
      logger.warn("Unauthorized access attempt by user", { userId });
      return responseError(
        res,
        403,
        "You are not authorized to view these orders"
      );
    }

    const sellerOrders = await getOrdersBySellerIdService(userId, "");
    if (sellerOrders.length === 0) {
      logger.warn("No orders found for seller", { userId });
      return responseError(res, 404, "No orders found for this seller");
    }

    const ordersWithDetails = await Promise.all(
      sellerOrders.map(async (order) => {
        let items;
        items = await getOrderItemsByOrderIdService(order.order_id);
        if (!items || items.length === 0) {
          logger.warn(`No items found for order ${order.order_id}`);
          return {
            ...order,
            error: "No items found for this order",
          };
        }
        try {
          const user = await axios.get(
            `${GLOBAL_SERVICE_URL}/user/user/${order.user_id}`,
            {
              headers: {
                Authorization: token,
                "Content-Type": "application/json",
              },
            }
          );
          return {
            ...order,
            user: user.data.user,
            items: items,
          };
        } catch (err) {
          logger.error(`Error processing order ${order.order_id}:`, err.message);
          return {
            ...order,
            error: "Failed to fetch user info for this order",
          };
        }
      })
    );
    
    logger.info("Orders fetched successfully");
    return responseSuccess(
      res,
      200,
      "Orders fetched successfully",
      "orders",
      ordersWithDetails
    );
  } catch (error) {
    logger.error("Error fetching restaurant orders:", error.message);
    return responseError(res, 500, "Failed to retrieve orders", error.message);
  }
};

export const getRestaurantDashboardByRestaurantIdController = async (
  req,
  res
) => {
  logger.info("GET RESTAURANT DASHBOARD BY RESTAURANT ID CONTROLLER");
  const { userId, role } = req.user;
  const token = req.headers.authorization;

  try {
    if (role !== "seller") {
      logger.warn("Unauthorized access attempt by user", { userId });
      return responseError(
        res,
        403,
        "You are not authorized to view these orders"
      );
    }

    const restaurantResponse = await axios.get(
      `${GLOBAL_SERVICE_URL}/restaurant/restaurant`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    const restaurant = restaurantResponse.data.restaurant;
    const restaurant_id = restaurant.restaurant_id;

    if (restaurant.owner_id !== userId) {
      logger.warn("Unauthorized access attempt by user", { userId });
      return responseError(
        res,
        403,
        "You are not authorized to view these orders"
      );
    }

    const orders = await getOrdersByRestaurantIdService(restaurant_id);
    if (orders.length === 0) {
      logger.warn("No orders found");
      return responseError(res, 404, "No orders found");
    }

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        try {
          let orderItems = [];
          let menuItems = [];
          let userInfo = null;

          if (order.order_type === "CART") {
            orderItems = await getOrderItemsByOrderIdService(order.order_id);

            const menuPromises = orderItems.map((item) =>
              axios.get(
                `${GLOBAL_SERVICE_URL}/restaurant/menu-by-id/${item.menu_id}`,
                {
                  headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                  },
                }
              )
            );

            const menuResponses = await Promise.all(menuPromises);
            menuItems = menuResponses.map((response) => response.data.menu);
          } else {
            orderItems = [order];

            const menuResponse = await axios.get(
              `${GLOBAL_SERVICE_URL}/restaurant/menu-by-id/${order.menu_id}`,
              {
                headers: {
                  Authorization: token,
                  "Content-Type": "application/json",
                },
              }
            );

            menuItems = [menuResponse.data.menu];
          }

          const userResponse = await axios.get(
            `${GLOBAL_SERVICE_URL}/user/user/${order.user_id}`,
            {
              headers: {
                Authorization: token,
                "Content-Type": "application/json",
              },
            }
          );

          userInfo = userResponse.data.user;

          return {
            ...order,
            items: order.order_type === "CART" ? orderItems : null,
            menu: menuItems,
            user: userInfo,
          };
        } catch (err) {
          logger.error(
            `Error processing order ${order.order_id}:`,
            err.message
          );
          return {
            ...order,
            error: "Failed to fetch complete details for this order",
          };
        }
      })
    );

    logger.info("Orders fetched successfully");
    return responseSuccess(
      res,
      200,
      "Orders fetched successfully",
      "orders",
      ordersWithDetails
    );
  } catch (error) {
    logger.error("Error fetching restaurant orders:", error.message);
    return responseError(res, 500, "Failed to retrieve orders", error.message);
  }
};

export const getRestaurantOrderController = async (req, res) => {
  logger.info("GET RESTAURANT ORDER CONTROLLER");
  const { role, userId } = req.user;
  const { order_id } = req.params;
  const token = req.headers.authorization;

  if (role !== "seller") {
    logger.warn("Unauthorized access attempt by user");
    return responseError(res, 403, "You are not authorized to view this order");
  }

  if (!order_id) {
    logger.warn("Missing order_id");
    return responseError(res, 400, "Missing order_id");
  }

  try {
    const order = await getOrderByIdService(order_id);
    if (!order) {
      logger.warn("Order not found");
      return responseError(res, 404, "Order not found");
    }

    if (order.seller_id !== userId) {
      logger.warn(
        `Unauthorized access attempt by user ${userId} on order ${order_id}`
      );
      return responseError(
        res,
        403,
        "You are not authorized to view this order"
      );
    }

    const orderItems = await getOrderItemsByOrderIdService(order.order_id);
    if (!orderItems || orderItems.length === 0) {
      logger.warn("No items found for this order");
      return responseError(res, 404, "No items found for this order");
    }

    const userResponse = await axios.get(
      `${GLOBAL_SERVICE_URL}/user/user/${order.user_id}`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!userResponse || !userResponse.data || !userResponse.data.user) {
      logger.warn("User not found");
      return responseError(res, 404, "User not found");
    }

    const transaction = await getTransactionByOrderIdService(order_id);
    if (!transaction) {
      logger.warn("Transaction not found");
      return responseError(res, 404, "Transaction not found");
    }

    const finalOrder = {
      ...order,
      items: orderItems,
      user: userResponse.data.user,
      transaction,
    };

    logger.info("Order fetched successfully");
    return responseSuccess(
      res,
      200,
      "Order fetched successfully",
      "order",
      finalOrder
    );
  } catch (err) {
    logger.error("Error fetching order:", err.message);
    return responseError(res, 500, "Internal server error");
  }
};

export const getCartItemsController = async (req, res) => {
  logger.info("GET CART ITEMS CONTROLLER");
  const { userId, role } = req.user;

  if (role !== "user") {
    logger.warn("Unauthorized access attempt by user");
    return responseError(res, 403, "You are not authorized to view this order");
  }

  try {
    const carts = await getCartsService(userId);
    if (!carts || carts.length === 0) {
      logger.warn("Carts not found");
      return responseSuccess(res, 200, "Carts is Empty", "cart", []);
    }

    const cartItems = await getCartItemsService(carts[0].cart_id);
    if (!cartItems || cartItems.length === 0) {
      logger.warn("Cart items not found");
      return responseSuccess(res, 200, "Cart is Empty", "cart", []);
    }
    const groupedCartItems = cartItems.reduce((acc, item) => {
      const { cart_id, menu_id, quantity } = item;
      const key = `${cart_id}-${menu_id}`;
      if (!acc[key]) {
        acc[key] = {
          cart_id,
          cart_item_id: item.cart_item_id,
          menu_id,
          total_quantity: 0,
          note: item.note || "",
          created_at: item.created_at,
          updated_at: item.updated_at,
          menu: item.menu || null,
        };
      }

      acc[key].total_quantity += quantity;
      return acc;
    }, {});

    const finalCartItems = Object.values(groupedCartItems);

    logger.info("Cart items fetched successfully");

    const cartItemsWithMenu = await Promise.all(
      finalCartItems.map(async (item) => {
        try {
          const response = await axios.get(
            `${GLOBAL_SERVICE_URL}/restaurant/menu-by-id/${item.menu_id}`,
            {
              headers: {
                Authorization: req.headers.authorization,
                "Content-Type": "application/json",
              },
            }
          );

          return {
            ...item,
            menu: response.data.menu,
          };
        } catch (err) {
          logger.error(
            `Failed to fetch menu for menu_id ${item.menu_id}:`,
            err.message
          );
          return {
            ...item,
            menu: null,
          };
        }
      })
    );

    return responseSuccess(
      res,
      200,
      "Cart items fetched successfully",
      "cartItems",
      cartItemsWithMenu
    );
  } catch (err) {
    logger.error("Error fetching cart items:", err);
    return responseError(res, 500, "Internal server error");
  }
};

export const checkoutCartController = async (req, res) => {
  logger.info("CHECKOUT CART CONTROLLER");
  const { userId, role } = req.user;
  const { cart_id } = req.params;
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  if (role !== "user") {
    logger.warn("Unauthorized access attempt by user");
    return responseError(res, 403, "You are not authorized to view this order");
  }

  if (!cart_id) {
    logger.warn("Missing cart_id");
    return responseError(res, 400, "Missing cart_id");
  }

  try {
    const cart = await getCartService(cart_id, userId);
    if (!cart) {
      logger.warn("Cart not found");
      return responseError(res, 404, "Cart not found");
    }

    const cartItems = await getCartItemsService(cart_id);

    const groupedCartItems = cartItems.reduce((acc, item) => {
      const { cart_id, quantity, menu_id } = item;
      const key = `${cart_id}-${menu_id}`;

      if (!acc[key]) {
        acc[key] = {
          cart_id,
          menu_id,
          total_quantity: 0,
        };
      }

      acc[key].total_quantity += quantity;
      return acc;
    }, {});

    const finalCartItems = Object.values(groupedCartItems);

    const menuData = new Map();
    let restaurantResponse;
    
    if (finalCartItems.length > 0) {
      try {
        for (const item of finalCartItems) {
          const menuId = item.menu_id;
          
          logger.info("Fetching menu data", { menuId });
          const menuRes = await axios.get(
            `${GLOBAL_SERVICE_URL}/restaurant/menu-by-Id/${menuId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!menuRes.data?.menu) {
            logger.error("Menu not found", { menuId });
            return responseError(res, 404, `Menu with ID ${menuId} not found`);
          }
          
          menuData.set(menuId, menuRes.data.menu);

          if (!restaurantResponse) {
            const restaurantId = menuRes.data.menu.restaurant_id;
            logger.info("Fetching restaurant data", { restaurantId });

            const restaurantRes = await axios.get(
              `${GLOBAL_SERVICE_URL}/restaurant/restaurant/${restaurantId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!restaurantRes.data?.restaurant) {
              logger.error("Restaurant not found", { restaurantId });
              return responseError(res, 404, `Restaurant with ID ${restaurantId} not found`);
            }
            restaurantResponse = restaurantRes.data.restaurant;
          }
        }
      } catch (error) {
        logger.error("Failed to fetch menu or restaurant data", {
          error: error.message,
          stack: error.stack,
        });
        return responseError(res, 500, "Failed to validate cart items");
      }
    }

    logger.info("Creating order from cart id:", cart_id);
    let order;

    const totalQuantity = finalCartItems.reduce(
      (acc, item) => acc + item.total_quantity,
      0
    );

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      order = await createOrderService(client, {
        userId: userId,
        restaurantId: cart.restaurant_id,
        orderType: "CART",
        restaurantName: restaurantResponse.restaurant_name,
        restaurantCity: restaurantResponse.restaurant_city,
        restaurantProvince: restaurantResponse.restaurant_province,
        restaurantDistrict: restaurantResponse.restaurant_district,
        restaurantVillage: restaurantResponse.restaurant_village,
        restaurantAddress: restaurantResponse.restaurant_address,
        restaurantImage: restaurantResponse.restaurant_image,
        quantity: totalQuantity,
        sellerId: restaurantResponse.owner_id,
      });

      if (!order || !order.order_id) {
        throw new Error("Failed to create order from cart - no order ID returned");
      }
      logger.info("Order created successfully:", { orderId: order.order_id });

      await Promise.all(
        finalCartItems.map(async (item) => {
          const menuInfo = menuData.get(item.menu_id);
          if (!menuInfo) {
            throw new Error(`Menu data not found for menu_id: ${item.menu_id}`);
          }

          return createOrderItemService(
            client,
            order.order_id,
            {
              menuId: item.menu_id,
              quantity: item.total_quantity,
              menuName: menuInfo.menu_name,
              menuDescription: menuInfo.menu_description,
              menuPrice: menuInfo.menu_price,
              menuImage: menuInfo.menu_image,
              menuCategory: menuInfo.menu_category,
            }
          );
        })
      );

      logger.info("Order items created successfully");
      logger.info("Resetting cart");
      await deleteUserCartService(userId);
      await client.query('COMMIT');
      client.release();
    } catch (err) {
      await client.query('ROLLBACK');
      client.release();
      logger.error("Transaction failed, rolled back:", {
        error: err.message,
        stack: err.stack,
        orderId: order?.order_id
      });
      throw err;
    }

    logger.info("Order created successfully:", order);
    return responseSuccess(
      res,
      200,
      "Order created successfully",
      "order",
      order
    );
  } catch (err) {
    logger.error("Error in checkout cart controller:", {
      error: err.message,
      stack: err.stack
    });
    return responseError(res, 500, err.message || "Internal server error");
  }
};

export const getTTLOrderController = async (req, res) => {
  logger.info("GET TTL ORDER CONTROLLER");
  const { order_id } = req.params;
  const key = `order:${order_id}`;
  try {
    const redisClient = getRedisClient();
    if (!redisClient) {
      logger.error("Redis client not initialized");
      return responseError(res, 500, "Redis client not initialized");
    }
    const ttl = await redisClient.ttl(key);
    if (ttl === -2) {
      logger.warn(`Order ${order_id} not found in Redis`);
      return responseError(res, 404, "Order not found");
    }

    logger.info(`Order ${order_id} TTL: ${ttl} seconds`);
    return responseSuccess(
      res,
      200,
      `Order ${order_id} TTL fetched successfully`,
      "ttl",
      ttl
    );
  } catch(err) {
    logger.error("Error fetching TTL for order:", err);
    return responseError(res, 500, "Internal server error");
  }
}