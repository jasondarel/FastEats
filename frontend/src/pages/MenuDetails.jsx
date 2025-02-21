import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const MenuDetails = () => {
  const { menuId } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔍 Received menuId:", menuId);
    const fetchMenuDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/restaurant/menu-by-id/${menuId}`,
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
        if (!data.menu) {
          throw new Error("Invalid menu data received");
        }
        setMenu(data.menu);
      } catch (error) {
        console.log("Error: ", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuDetails();
  }, [menuId]);

  if (loading)
    return (
      <div className="text-center p-5 text-lg font-semibold text-gray-700">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center p-5 text-lg font-semibold">
        {error}
      </div>
    );
  if (!menu)
    return (
      <div className="text-gray-500 text-center p-5 text-lg font-semibold">
        Menu not found.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <Link
        to={`/restaurant/${menu.restaurant_id}/menu`}
        className="absolute top-8 right-8 flex items-center justify-center w-12 h-12 bg-white text-yellow-500 text-2xl rounded-full focus:outline-none hover:bg-yellow-500 hover:text-white hover:cursor-pointer transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </Link>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {menu.menu_name || "Unnamed Dish"}
      </h1>
      <img
        src={
          menu.menu_image ||
          "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
        }
        alt={menu.menu_name || "Menu item"}
        className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
      />
      <p className="text-sm uppercase tracking-wide font-semibold text-gray-600 mb-2">
        {menu.menu_category || "No category"}
      </p>
      <p className="text-2xl font-bold text-yellow-700">
        Rp {menu.menu_price ? menu.menu_price.toLocaleString() : "N/A"}
      </p>
      <p className="mt-3 text-gray-700 leading-relaxed">
        {menu.menu_description || "No description available."}
      </p>
    </div>
  );
};

export default MenuDetails;
