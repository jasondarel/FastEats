// hooks/useMenuData.js
import { useState, useEffect } from "react";

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
          `http://localhost:5000/restaurant/menu/${restaurantId}`,
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
