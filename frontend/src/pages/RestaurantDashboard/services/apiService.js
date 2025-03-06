// services/apiService.js

const API_BASE_URL = "http://localhost:5000";

/**
 * Fetch restaurant information
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Restaurant information
 */
export const fetchRestaurantInfo = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurant/restaurant`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Error fetching restaurant info:", err);
    throw err;
  }
};

/**
 * Fetch order lists for the restaurant dashboard
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Orders data
 */
export const fetchOrderLists = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order/restaurant-dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("Error fetching orders:", err);
    throw err;
  }
};
