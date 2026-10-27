import logger from "../config/loggerInit.js";
import envInit from "../config/envInit.js";
import { getAllOrderWithItemsByOrderIdService } from "../service/orderService.js";
import {
  getUserInformation,
  getRestaurantInformation,
  getMenuInformation,
} from "../../../packages/shared/apiService.js";

envInit();

const GLOBAL_SERVICE_URL = process.env.GLOBAL_SERVICE_URL;

export const getOrderDetailsInformation = async (orderId, token) => {
  const orderItems = await getAllOrderWithItemsByOrderIdService(orderId);
  if (!orderItems) {
    logger.warn(`Order with ID ${orderId} not found or has no items`);
    return null;
  }

  const restaurantData = await getRestaurantInformation(
    GLOBAL_SERVICE_URL,
    orderItems.restaurant_id,
    token,
    `Restaurant with ID ${orderItems.restaurant_id} not found`
  );
  if (!restaurantData) return null;
  const restaurant = restaurantData.restaurant;

  const itemsWithMenuDetails = await Promise.all(
    orderItems.items.map(async (item) => {
      const menuData = await getMenuInformation(
        GLOBAL_SERVICE_URL,
        item.menu_id,
        token,
        `Menu with ID ${item.menu_id} not found`
      );
      const menu = menuData?.menu || {};
      return {
        ...item,
        menu_name: menu.name || menu.menu_name || `Menu #${item.menu_id}`,
        menu_description: menu.menu_description || "Menu details unavailable",
        menu_price: menu.menu_price || 0,
        menu_image: menu.image || menu.menu_image || "",
        menu_category: menu.category || "Unknown",
      };
    })
  );

  const ownerData = await getUserInformation(
    GLOBAL_SERVICE_URL,
    restaurant.owner_id,
    token,
    `Owner with ID ${restaurant.owner_id} not found`
  );
  if (!ownerData) return null;

  const customerData = await getUserInformation(
    GLOBAL_SERVICE_URL,
    orderItems.user_id,
    token,
    `Customer with ID ${orderItems.user_id} not found`
  );
  if (!customerData) return null;

  return {
    ...orderItems,
    items: itemsWithMenuDetails,
    restaurant,
    ownerName: ownerData.user.name,
    ownerEmail: ownerData.user.email,
    customerName: customerData.user.name,
    customerEmail: customerData.user.email,
  };
};
