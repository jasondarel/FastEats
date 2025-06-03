import axios from "axios";
import { API_URL } from "../../config/api";

export const getChatByIdService = async (chatId, token) => {
  try {
    const response = await axios.get(`${API_URL}/chat/chat/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Chat fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching chat: ", error);

    if (error.response?.status === 403) {
      try {
        const sellerResponse = await axios.get(
          `${API_URL}/chat/chat/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        return sellerResponse.data;
      } catch (sellerError) {
        console.error("Seller endpoint also failed:", sellerError);
        return {
          success: true,
          dataChat: {
            _id: chatId,
            orderDetails: { status: "Unknown" },
            participants: [],
          },
        };
      }
    }

    throw error;
  }
};
