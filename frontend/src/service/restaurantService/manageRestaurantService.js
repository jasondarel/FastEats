import axios from "axios";
import { API_URL } from "../../config/api";

const getRestaurantData = async (token) => {
  return await axios.get(`${API_URL}/restaurant/restaurant`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

const updateRestaurant = async (token, formData) => {
  return await axios.put(`${API_URL}/restaurant/restaurant`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

const toggleRestaurantStatus = async (token, isOpen) => {
  return await axios.patch(
    `${API_URL}/restaurant/is-open`,
    { isOpen },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export { getRestaurantData, updateRestaurant, toggleRestaurantStatus };
