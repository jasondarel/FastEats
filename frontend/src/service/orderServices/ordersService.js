import axios from "axios";
import { API_URL } from "../../config/api";

// const getOrderHistoryService = async (token) => {
//   const response = await axios.get(`${API_URL}/order/orders`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });
//   return response;
// };

const getAllOrdersWithItems = async (token) => {
  const response = await axios.get(`${API_URL}/order/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  console.log("response", response);
  return response;
};

export default getAllOrdersWithItems;
