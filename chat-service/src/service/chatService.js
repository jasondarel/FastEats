import { Chat, Message } from "../config/schema.js";
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

export const getChatByIdService = async (chatId) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return { success: false, error: 'Chat not found' };
        }
        return { success: true, chat };
    } catch (error) {
        logger.error('Error retrieving chat by ID:', error);
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

export const createMessageService = async (messageData) => {
    try {
        if (messageData.chatId) messageData.chatId = messageData.chatId.toString();
        if (messageData.sender && messageData.sender.id) {
            messageData.sender.id = Number(messageData.sender.id);
        }
        
        const newMessage = new Message(messageData);
        
        const savedMessage = await newMessage.save();
        return { success: true, message: savedMessage };
    } catch (error) {
        logger.error('Error creating message:', error);
        return { success: false, error: error.message };
    }
}