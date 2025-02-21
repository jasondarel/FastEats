import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";

const validCategories = ["Food", "Drink", "Dessert", "Others"];

const MenuPage = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const navigate = useNavigate();

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setFilterCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

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

  // Handle search input
  const handleSearch = (e) => setSearchQuery(e.target.value);

  // Handle category filter
  const handleCategoryFilter = (e) => setFilterCategory(e.target.value);

  // Handle price range input
  const handleMinPriceChange = (e) => setMinPrice(e.target.value);
  const handleMaxPriceChange = (e) => setMaxPrice(e.target.value);

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

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Get number of active filters
  const activeFilterCount = [
    filterCategory ? 1 : 0,
    minPrice || maxPrice ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  if (isLoading) {
    return <div className="text-center p-5">Loading menu...</div>;
  }

  return (
    <div className="flex ml-0 md:ml-64 bg-white min-h-screen">
      <Sidebar />
      <button
        onClick={() => navigate("/home")}
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
      </button>
      <main className="flex-1 p-5 relative mt-20 ml-10">
        <h1 className="text-3xl font-bold mb-6 text-yellow-600">Menu</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-center">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-lg">
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full p-2 pl-10 border border-yellow-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-yellow-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
          </div>

          {/* Filter Button and Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={toggleFilters}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                activeFilterCount > 0
                  ? "bg-yellow-500 text-white border-yellow-600"
                  : "bg-white text-yellow-700 border-yellow-400 hover:bg-yellow-50"
              } transition-colors duration-200 hover:cursor-pointer`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                />
              </svg>
              Filter
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-yellow-600 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-yellow-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-yellow-800">
                      Filters
                    </h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-yellow-600 hover:text-yellow-800"
                    >
                      Clear all
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={handleCategoryFilter}
                      className="w-full p-2 border border-yellow-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {validCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={handleMinPriceChange}
                        className="w-full p-2 border border-yellow-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        className="w-full p-2 border border-yellow-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        {filteredMenu.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <h3 className="text-xl font-bold text-yellow-800 group-hover:text-white">
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
