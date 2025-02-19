import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const MenuDetails = () => {
  const { menuId } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/restaurant/menu/${menuId}`, // ✅ Fixed API endpoint
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch menu details");
        }

        const data = await response.json();

        // Check the API response structure
        if (!data || !data.menu_name) {
          throw new Error("Invalid menu data received");
        }

        setMenu(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuDetails();
  }, [menuId]);

  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-5">{error}</div>;
  if (!menu)
    return <div className="text-gray-500 text-center p-5">Menu not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-5">
      <Link
        to={`/restaurant/${menu.restaurant_id}/menu`}
        className="text-blue-500 mb-4 block"
      >
        ← Back to Menu
      </Link>
      <h1 className="text-3xl font-bold mb-4">
        {menu.menu_name || "Unnamed Dish"}
      </h1>
      <img
        src={
          menu.menu_image ||
          "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
        }
        alt={menu.menu_name || "Menu item"}
        className="w-full h-60 object-cover rounded-lg mb-4"
      />
      <p className="text-gray-600 italic mb-2">
        {menu.menu_category || "No category"}
      </p>
      <p className="text-lg font-bold text-yellow-700">
        Rp {menu.menu_price ? menu.menu_price.toLocaleString() : "N/A"}
      </p>
      <p className="mt-3 text-gray-700">
        {menu.menu_description || "No description available."}
      </p>
    </div>
  );
};

export default MenuDetails;
