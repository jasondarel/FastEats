import { 
    getChatsServiceByUserId,
    getChatsServiceByRestaurantId
} from "../service/chatService.js";
import { 

} from "../validator/chatValidators.js";
import axios from "axios";
import envInit from "../config/envInit.js";
import logger from "../config/loggerInit.js";

envInit();

const GLOBAL_SERVICE_URL = process.env.GLOBAL_SERVICE_URL;

export const getChatsController = async (req, res) => {
    logger.info("GET CHATS CONTROLLER");
    const { userId, role } = req.user;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!userId) {
            logger.warn("User ID not found in request");
            return res.status(400).json({
                success: false,
                message: "User ID not found"
            });
        }
        console.log('Role:', role);
        if (role === "user") {
            const chats = await getChatsServiceByUserId(userId);
            logger.info(`Get chats success: ${chats.length} chats found`);

            const finalInformation = await Promise.all(chats.chats?.map(async (chat) => {
                const restaurantResponse = await axios.get(`${GLOBAL_SERVICE_URL}/restaurant/restaurant/${chat.restaurantId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                const plainChat = chat.toObject ? chat.toObject() : chat;
                
                return {
                    ...plainChat,
                    restaurant: restaurantResponse.data.restaurant
                };
            }));
            return res.status(200).json({
                success: true,
                message: "Get chats success",
                dataChats: finalInformation
            });
        } else {
            const restaurant = await axios.get(`${GLOBAL_SERVICE_URL}/restaurant/restaurant/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!restaurant.data.success) {
                logger.warn("Restaurant not found");
                return res.status(404).json({
                    success: false,
                    message: "Restaurant not found"
                });
            }

            const restaurantId = restaurant.data.restaurant.restaurant_id;
            const chats = await getChatsServiceByRestaurantId(restaurantId);

            const finalInformation = await Promise.all(chats.chats.map(async (chat) => {
                const userResponse = await axios.get(`${GLOBAL_SERVICE_URL}/user/user/${chat.userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const plainChat = chat.toObject ? chat.toObject() : chat;
                return {
                    ...plainChat,
                    user: userResponse.data.user
                };
            }));

            logger.info(`Get chats success: ${finalInformation.length} chats found`);
            return res.status(200).json({
                success: true,
                message: "Get chats success",
                dataChats: finalInformation
            });
        }
    } catch (err) {
        logger.error("Internal Server Error", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}