import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
        setRestaurants(data.restaurants);
        setFilteredRestaurants(data.restaurants); // Initialize filtered list
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

    const filtered = restaurants.filter((restaurant) =>
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
        <div className="flex center justify-center mb-10">
          <div className="w-80 h-40">
            <DotLottieReact
              src="https://lottie.host/6d42c3d8-1480-4f75-81d8-fe093ce5650c/KwFjMHFmhK.lottie"
              loop
              autoplay
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-yellow-700 mb-4">
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
        <div className="mb-4 flex items-center justify-center">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-72 p-2 border bg-white border-yellow-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
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
                        src={`http://localhost:5000/restaurant/uploads/${restaurant.restaurant_image}`}
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
              No restaurants match your search. 🍽️
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
