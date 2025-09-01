import axios from "axios";
import { API_URL } from "../../config/api";

const insertOrderService = async (menuId, quantity, token, addsOnData) => {
  const response = await axios.post(
    `${API_URL}/order/order`,
    {
      menuId: menuId,
      quantity: quantity,
      addsOnData: addsOnData,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response;
};

export default insertOrderService;
