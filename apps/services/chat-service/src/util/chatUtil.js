import axios from "axios";
import logger from "../config/loggerInit.js";
import { responseError } from "./responseUtil.js";
import envInit from "../config/envInit.js";
envInit();
import { getChatsServiceByRestaurantId, getChatsServiceByUserId } from "../service/chatService.js";

const GLOBAL_SERVICE_URL = process.env.GLOBAL_SERVICE_URL;

export const getSellerChatsUtil = async (res, {userId, role, token}) => {
    try {
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
        return {
            success: true,
            chats: finalInformation,
        };
    } catch (error) {
        console.error("Error fetching seller chats:", error);
        logger.error("Error fetching seller chats:", error.message);
        return responseError(
            res,
            500,
            "Failed to fetch seller chats",
            error.message
        );
    }
}

export const getUserChatsUtil = async (res, {userId, role, token}) => {
    try {
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
        return {
            success: true,
            chats: finalInformation,
        }
    } catch(error) {
        console.error("Error fetching user chats:", error);
        logger.error("Error fetching user chats:", error.message);
        return responseError(
            res,
            500,
            "Failed to fetch user chats",
            error.message
        );
    }
}