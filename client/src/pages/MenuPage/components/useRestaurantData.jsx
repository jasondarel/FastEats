// hooks/useRestaurantData.js
import { useState, useEffect } from "react";
import { API_URL } from "../../../config/api";

const useRestaurantData = (restaurantId) => {
  const [restaurant, setRestaurant] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {const fetchRestaurant = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please log in.");
    }

    const response = await fetch(
      `${API_URL}/restaurant/restaurant/${restaurantId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed fetch. Status:", response.status, errorText);
      throw new Error(`Fetch failed: ${errorText || response.statusText}`);
    }

    const data = await response.json(); 
    console.log("Fetched restaurant data:", data);
    setRestaurant(data.restaurant || data);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };


    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId]);

  return { restaurant, error, isLoading };
};

export default useRestaurantData;