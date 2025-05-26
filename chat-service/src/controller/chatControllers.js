import {
  getChatsServiceByUserId,
  getChatsServiceByRestaurantId,
  createChatService,
} from "../service/chatService.js";
import {} from "../validator/chatValidators.js";
import axios from "axios";
import envInit from "../config/envInit.js";
import logger from "../config/loggerInit.js";
import { responseError, responseSuccess } from "../util/responseUtil.js";

envInit();

const GLOBAL_SERVICE_URL = process.env.GLOBAL_SERVICE_URL;

export const getChatsController = async (req, res) => {
  logger.info("GET CHATS CONTROLLER");
  const { userId, role } = req.user;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    if (!userId) {
      logger.warn("User ID not found in request");
      return responseError(res, 400, "User ID not found");
    }
    console.log("Role:", role);
    if (role === "user") {
      console.log("User role detected");
      const chats = await getChatsServiceByUserId(userId);
      logger.info(`Get chats success: ${chats.length} chats found`);

      const finalInformation = await Promise.all(
        chats.chats?.map(async (chat) => {
          const restaurantResponse = await axios.get(
            `${GLOBAL_SERVICE_URL}/restaurant/restaurant/${chat.restaurantId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const orderResponse = await axios.get(
            `${GLOBAL_SERVICE_URL}/order/order-items/${chat.orderId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const itemsWithMenu = await Promise.all(
            orderResponse.data.order.items.map(async (item) => {
              try {
                const menuResponse = await axios.get(
                  `${GLOBAL_SERVICE_URL}/restaurant/menu-by-id/${item.menu_id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                return {
                  ...item,
                  menuDetails: menuResponse.data.menu,
                };
              } catch (error) {
                logger.warn(
                  `Failed to fetch menu for item ${item.menu_id}:`,
                  error.message
                );
                return {
                  ...item,
                  menuDetails: null,
                };
              }
            })
          );

          const plainChat = chat.toObject ? chat.toObject() : chat;
          return {
            ...plainChat,
            restaurant: restaurantResponse.data.restaurant,
            orderDetails: {
              ...orderResponse.data.order,
              items: itemsWithMenu,
            },
          };
        })
      );
      return responseSuccess(
        res,
        200,
        "Get chats success",
        "dataChats",
        finalInformation
      );
    } else {
      const restaurant = await axios.get(
        `${GLOBAL_SERVICE_URL}/restaurant/restaurant-owner/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!restaurant.data.success) {
        logger.warn("Restaurant not found");
        return responseError(res, 404, "Restaurant not found");
      }

      const restaurantId = restaurant.data.restaurant.restaurant_id;
      const chats = await getChatsServiceByRestaurantId(restaurantId);

      const finalInformation = await Promise.all(
        chats.chats.map(async (chat) => {
          const userResponse = await axios.get(
            `${GLOBAL_SERVICE_URL}/user/user/${chat.userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const orderResponse = await axios.get(
            `${GLOBAL_SERVICE_URL}/order/order-items/${chat.orderId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const itemsWithMenu = await Promise.all(
            orderResponse.data.order.items.map(async (item) => {
              try {
                const menuResponse = await axios.get(
                  `${GLOBAL_SERVICE_URL}/restaurant/menu-by-id/${item.menu_id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                return {
                  ...item,
                  menuDetails: menuResponse.data.menu,
                };
              } catch (error) {
                logger.warn(
                  `Failed to fetch menu for item ${item.menu_id}:`,
                  error.message
                );
                return {
                  ...item,
                  menuDetails: null,
                };
              }
            })
          );

          const plainChat = chat.toObject ? chat.toObject() : chat;
          return {
            ...plainChat,
            user: userResponse.data.user,
            orderDetails: {
              ...orderResponse.data.order,
              items: itemsWithMenu,
            },
          };
        })
      );

      logger.info(`Get chats success: ${finalInformation.length} chats found`);
      return responseSuccess(
        res,
        200,
        "Get chats success",
        "dataChats",
        finalInformation
      );
    }
  } catch (err) {
    logger.error("Internal Server Error", err);
    return responseError(res, 500, "Internal Server Error");
  }
};

export const createChatController = async (req, res) => {
  logger.info("CREATE CHAT CONTROLLER");
  const { orderId } = req.body;
  const token =
    req.headers.authorization?.split(" ")[1] || req.headers.authorization;
  try {
    const order = await axios.get(
      `${GLOBAL_SERVICE_URL}/order/order-items/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const chat = await createChatService({
      orderId: order.data.order.order_id,
      restaurantId: order.data.order.restaurant_id,
      userId: order.data.order.user_id,
    });
    if (!chat.success) {
      logger.warn("Chat creation failed");
      return responseError(res, 400, "Chat creation failed");
    }
    logger.info("Create chat controller");
    return responseSuccess(res, 200, "Get order success", "dataChat", chat);
  } catch (err) {
    logger.error("Internal Server Error", err);
    return responseError(res, 500, "Internal Server Error");
  }
};
