import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const MyMenuPage = () => {
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

        const response = await fetch(`http://localhost:5000/restaurant/menus`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

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
    <div className="flex  ml-0 md:ml-64 bg-white min-h-screen">
      <Sidebar />
      <main className="flex-1 p-5 relative">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">My Menu</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {menuItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.menu_id}
                className="bg-yellow-100 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border hover:bg-yellow-600 hover:border-yellow-800 border-yellow-300 group cursor-pointer"
              >
                <img
                  src={
                    item.menu_image
                      ? item.menu_image
                      : "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
                  }
                  alt={item.menu_name}
                  className="w-full h-40 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                />
                <h3 className="text-xl font-bold text-yellow-800 group-hover:text-white ">
                  {item.menu_name}
                </h3>
                <p className="text-sm text-gray-500 italic group-hover:text-white">
                  {item.menu_category}
                </p>
                <p className="text-gray-700 mt-2 group-hover:text-white">
                  Rp {item.menu_price}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No menu available.
          </div>
        )}

        {/* Floating Add Menu Button */}
        <button className="fixed bottom-10 right-10 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition-transform transform hover:scale-105">
          + Add Menu
        </button>
      </main>
    </div>
  );
};

export default MyMenuPage;
