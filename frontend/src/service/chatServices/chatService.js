import axios from "axios";
import { API_URL } from "../../config/api";

export const getChatByIdService = async (chatId, token) => {
    try {
    const response = await axios.get(
      `${API_URL}/chat/chat/${chatId}`,
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
}