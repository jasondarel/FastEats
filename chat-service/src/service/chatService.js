import { Chat } from "../config/schema.js";
import logger from "../config/loggerInit.js";

export const getChatsServiceByUserId = async (userId) => {
    try {
        const chats = await Chat.find({ userId: Number(userId) }).sort({ updatedAt: -1 });
        return { success: true, chats };
    } catch (error) {
        logger.error('Error retrieving user chats:', error);
        return { success: false, error: error.message };
    }
};

export const getChatsServiceByRestaurantId = async (restaurantId) => {
    try {
        const chats = await Chat.find({ restaurantId: Number(restaurantId) }).sort({ updatedAt: -1 });
        return { success: true, chats };
    } catch (error) {
        logger.error('Error retrieving restaurant chats:', error);
        return { success: false, error: error.message };
    }
};

export const createChatService = async (chatData) => {
    try {
        if (chatData.restaurantId) chatData.restaurantId = Number(chatData.restaurantId);
        if (chatData.userId) chatData.userId = Number(chatData.userId);
        if (chatData.orderId) chatData.orderId = Number(chatData.orderId);
        
        const newChat = new Chat(chatData);
        
        const savedChat = await newChat.save();
        return { success: true, chat: savedChat };
    } catch (error) {
        logger.error('Error creating chat:', error);
        return { success: false, error: error.message };
    }
}