import axios from "axios";
import { API_URL } from "../../config/api";

export const getRestaurantData = async (token) => {
  return await axios.get(`${API_URL}/restaurant/restaurant`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const updateRestaurant = async (token, formData) => {
  return await axios.put(`${API_URL}/restaurant/restaurant`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const toggleRestaurantStatus = async (token, isOpen) => {
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

export const getRestaurants = async(locationData=null, token) => {
  let url = `${API_URL}/restaurant/restaurants`;
  if (locationData) {
    const params = Object.entries(locationData)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    if (params) {
      url += `?${params}`;
    }
  }
    console.log("URL: ", url);
  try {
      const response = await axios.get(url, {
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
          },
      });
      if (response) return response;
  } catch(err) {
      throw new Error(err);
  }
}