import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";

const MenuPage = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filteredMenu = menuItems.filter((item) =>
    item.menu_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center p-5">Loading menu...</div>;
  }

  return (
    <div className="flex ml-0 md:ml-64 bg-white min-h-screen">
      <Sidebar />
      <button
        onClick={() => navigate("/home")}
        className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 
             bg-white text-yellow-500 text-2xl rounded-full focus:outline-none 
             hover:bg-yellow-500 hover:text-white hover:cursor-pointer transition 
             z-50"
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
      </button>
      <main className="flex-1 p-5 relative mt-20 ml-10">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">Menu</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4 flex justify-center">
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-72 p-2 border border-yellow-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {filteredMenu.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMenu.map((item) => (
              <Link key={item.menu_id} to={`/menu-details/${item.menu_id}`}>
                <div
                  className="bg-yellow-100 rounded-xl p-5 shadow-md border border-yellow-300 
                         transition-all duration-300 hover:shadow-lg hover:bg-yellow-400 
                         hover:border-yellow-800 cursor-pointer"
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            No menu available.
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;
