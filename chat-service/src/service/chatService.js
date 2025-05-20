import axios from "axios";
import { Chat } from "../config/schema.js";

// export const isRestaurantAvailableByNameId = async (restaurantName, restaurantId) => {
//     const result = await pool.query(
//         `SELECT 1 FROM restaurants WHERE restaurant_name = $1 AND restaurant_id != $2`,
//         [restaurantName, restaurantId]
//     );
//     return result.rowCount > 0;
// };

export const getChatsService = async (userId) => {
    try {
        const numericUserId = Number(userId);
        
        const chats = await Chat.find({ userId: numericUserId })
        .sort({ updatedAt: -1 })
        .exec();
        
        return {
        success: true,
        data: chats
        };
    } catch (error) {
        console.error('Error retrieving user chats:', error);
        return {
        success: false,
        error: error.message
        };
    }
};