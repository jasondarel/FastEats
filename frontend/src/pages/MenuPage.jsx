import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const MenuPage = () => {
  const { restaurantId } = useParams();
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

  if (isLoading) {
    return <div className="text-center p-5">Loading menu...</div>;
  }

  return (
    <div className="flex ml-64">
      <Sidebar />
      <main className="flex-1 p-5">
        <h1 className="text-2xl font-bold mb-4">Menu</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {menuItems.length > 0 ? (
          <div className="grid gap-4">
            {menuItems.map((item) => (
              <div
                key={item.menu_id}
                className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-800">{item.menu_name}</h3>
                <p className="text-gray-600 mt-1">Rp {item.menu_price}</p> {/* FIXED: Use `menu_price` */}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">No menu available.</div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;
