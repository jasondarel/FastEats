import axios from "axios";
import { API_URL } from "../../config/api";

export const getChatsService = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/chat/chats/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

export const createChatService = async (orderId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/chat/`,
      { orderId: orderId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating chat: ", error);
    throw error;
  }
};
