import { API_URL } from "../../../config/api";

export const getRestaurantRatingService = async (restaurantId, token) => {
  try {
    const response = await fetch(
      `${API_URL}/restaurant/detail-rate?restaurantId=${restaurantId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching restaurant ratings:", error);
    throw error;
  }
};

export default getRestaurantRatingService;