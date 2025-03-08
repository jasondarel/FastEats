import axios from "axios";
import { API_URL } from "../../config/api";

const getOrderHistoryService = async (token) => {
  const response = await axios.get(`${API_URL}/order/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
};

export default getOrderHistoryService;
