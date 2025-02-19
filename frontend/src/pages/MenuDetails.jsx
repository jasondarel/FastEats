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
        className="text-yellow-600 hover:text-yellow-700 hover:underline flex items-center mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z"
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
