// hooks/useMenuData.js
import { useState, useEffect } from "react";
import { API_URL } from "../../../config/api";

const useMenuData = (restaurantId) => {
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await fetch(
          `${API_URL}/restaurant/menu/${restaurantId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch menu.");
        }

        const data = await response.json();
        setMenuItems(data.menus || []);
      } catch (error) {
        console.error("Error fetching menu:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId]);

  return { menuItems, error, isLoading };
};

export default useMenuData;
