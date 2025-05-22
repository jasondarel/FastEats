import axios from "axios";
import { Chat } from "../config/schema.js";


export const getChatsServiceByUserId = async (userId) => {
    try {
        const numericUserId = Number(userId);
        
        const chats = await Chat.find({ userId: numericUserId })
        .sort({ updatedAt: -1 })
        .exec();
        
        return {
        success: true,
        chats: chats
        };
    } catch (error) {
        console.error('Error retrieving user chats:', error);
        return {
        success: false,
        error: error.message
        };
    }
};

export const getChatsServiceByRestaurantId = async (restaurantId) => {
    try {
        const numericRestaurantId = Number(restaurantId);
        
        const chats = await Chat.find({ restaurantId: numericRestaurantId })
        .sort({ updatedAt: -1 })
        .exec();
        
        return {
        success: true,
        chats: chats
        };
    } catch (error) {
        console.error('Error retrieving restaurant chats:', error);
        return {
        success: false,
        error: error.message
        };
    }
};