import axios from "axios";

const getOrderHistoryService = async (token) => {
  const response = await axios.get("http://localhost:5000/order/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
};

export default getOrderHistoryService;
