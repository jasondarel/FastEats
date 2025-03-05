import axios from "axios";

const insertOrderService = async (menuId, quantity, token) => {
  const response = await axios.post(
    "http://localhost:5000/order/order",
    {
      menuId: menuId,
      quantity: quantity,
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
