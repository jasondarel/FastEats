import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Carousel } from "flowbite-react";
import bannerMain from "../assets/bannerMain.png";
import banner1 from "../assets/banner1.png";
import banner2 from "../assets/banner2.png";

const Home = () => {
  const [username, setUsername] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]); // New state for filtered results
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please log in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user profile. Status: ${response.status}`
          );
        }

        const data = await response.json();
        setUsername(data.user?.name || "Guest");
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await fetch(
          "http://localhost:5000/restaurant/restaurants",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch restaurants.");
        }

        const data = await response.json();

        // 🔥 Filter out closed restaurants before updating state
        const openRestaurants = data.restaurants.filter(
          (restaurant) => restaurant.is_open
        );

        setRestaurants(openRestaurants);
        setFilteredRestaurants(openRestaurants); // Only store open restaurants
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError(error.message);
      }
    };

    fetchUser();
    fetchRestaurants();
  }, []);

  // Handle search
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = restaurants
      .filter((restaurant) => restaurant.is_open) // 🔥 Ensure only open restaurants
      .filter((restaurant) =>
        restaurant.restaurant_name.toLowerCase().includes(query)
      );

    setFilteredRestaurants(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex ml-64 bg-yellow-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-5 flex items-center justify-center">
          <div className="text-yellow-600 font-semibold text-lg">
            Loading...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex ml-0 md:ml-64 bg-yellow-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-5">
        <div className="h-56 sm:h-64 xl:h-80 2xl:h-96 xl:px-50">
          <Carousel>
            <img
              className="scale-x-100 scale-y-[0.7] bg-amber-900"
              src={bannerMain}
              alt="..."
            />
            <img className="scale-x-100 scale-y-65" src={banner1} alt="..." />
            <img className="scale-y-[0.65]" src={banner2} alt="..." />
          </Carousel>
        </div>

        <h1 className="text-3xl font-bold text-yellow-700 mb-4 mt-10">
          Welcome, {username}! 🍽️
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 shadow-md">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-800 text-lg font-medium">
            What would you like to eat today?
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center items-center">
          <div className="relative flex-grow max-w-lg w-full">
            <input
              type="text"
              placeholder="Search Restaurant..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full p-2 pl-10 border border-yellow-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
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
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">
            🍕 Available Restaurants
          </h2>
          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.restaurant_id}
                  className="w-full border border-yellow-300 rounded-lg bg-white shadow-lg hover:shadow-xl hover:bg-yellow-100 transition-all cursor-pointer"
                  onClick={() =>
                    navigate(`/restaurant/${restaurant.restaurant_id}/menu`)
                  }
                >
                  <div className="h-48 w-full bg-yellow-200 rounded-t-lg flex items-center justify-center overflow-hidden">
                    {restaurant.restaurant_image ? (
                      <img
                        className="w-full h-full object-cover rounded-t-lg"
                        src={`http://localhost:5000/restaurant/uploads/restaurant/${restaurant.restaurant_image}`}
                        alt={restaurant.restaurant_name}
                      />
                    ) : (
                      <span className="text-gray-600 text-lg font-semibold">
                        Image
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {restaurant.restaurant_name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {restaurant.restaurant_address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 text-center py-8">
              No open restaurants match your search. 🍽️
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
