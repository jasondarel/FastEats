import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import BackButton from "../components/BackButton";

const MenuPage = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);

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

  // Filter logic
  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch = item.menu_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory
      ? item.menu_category === filterCategory
      : true;

    const price = parseInt(item.menu_price);
    let matchesPrice = true;
    if (minPrice && price < parseInt(minPrice)) matchesPrice = false;
    if (maxPrice && price > parseInt(maxPrice)) matchesPrice = false;

    // Only show available items unless showUnavailable is toggled on
    const matchesAvailability = showUnavailable
      ? true
      : item.is_available === true;

    return (
      matchesSearch && matchesCategory && matchesPrice && matchesAvailability
    );
  });

  if (isLoading) {
    return <div className="text-center p-5">Loading menu...</div>;
  }

  return (
    <div className="flex ml-0 md:ml-64 bg-white min-h-screen">
      <Sidebar />
      <BackButton to="/home" />
      <main className="flex-1 p-5 relative mt-20 ml-10">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">Menu</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Using the SearchBar component */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          showUnavailable={showUnavailable}
          setShowUnavailable={setShowUnavailable}
          placeholder="Search menu items..." // Custom placeholder for menu search
        />

        {/* Menu Items */}
        {filteredMenu.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMenu.map((item) => (
              <Link key={item.menu_id} to={`/menu-details/${item.menu_id}`}>
                <div
                  className={`rounded-xl shadow-md border transition-all duration-300 
                            hover:shadow-lg cursor-pointer overflow-hidden
                            ${
                              item.is_available
                                ? "bg-yellow-100 border-yellow-300 hover:bg-yellow-400 hover:border-yellow-800"
                                : "bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                            }`}
                >
                  <div className="relative">
                    <img
                      src={
                        item.menu_image
                          ? `http://localhost:5000/restaurant/uploads/menu/${item.menu_image}`
                          : "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
                      }
                      alt={item.menu_name}
                      className={`w-full h-50 object-cover rounded-t-xl ${
                        !item.is_available && "opacity-50"
                      }`}
                    />
                    {!item.is_available && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        Unavailable
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3
                      className={`text-xl font-bold ${
                        item.is_available ? "text-yellow-800" : "text-gray-500"
                      }`}
                    >
                      {item.menu_name}
                    </h3>
                    <p className="text-sm text-gray-500 italic">
                      {item.menu_category}
                    </p>
                    <p
                      className={`mt-2 ${
                        item.is_available ? "text-gray-700" : "text-gray-500"
                      }`}
                    >
                      Rp {item.menu_price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            {searchQuery || filterCategory || minPrice || maxPrice
              ? "No menu items match your search criteria."
              : "No menu available."}
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuPage;
