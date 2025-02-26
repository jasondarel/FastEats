import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import bannerMain from "../assets/bannerMain.png";
import banner1 from "../assets/banner1.png";
import banner2 from "../assets/banner2.png";
import SearchBar from "../components/SearchBar"; // Import the updated SearchBar component

import RotatingText from "../blocks/TextAnimations/RotatingText/RotatingText";

const Home = () => {
  const [username, setUsername] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

        // Filter out closed restaurants before updating state
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

  // Update filtered restaurants whenever search query changes
  useEffect(() => {
    const filtered = restaurants.filter((restaurant) =>
      restaurant.restaurant_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants]);

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
        

        <h1 className="flex-col flex items-center justify-center text-xl md:text-3xl xl:text-5xl font-bold text-yellow-700 mb-4 mt-5">
          <div className="flex items-end bg-black justify-center min-w-30 md:min-w-50 xl:min-w-70 rounded-xl">
            <RotatingText
              texts={[
                "Hello",
                "¡Hola!",
                "你好",
                "привет",
                "こんにちは",
                "안녕하세요",
                "สวัสดีครับ",
              ]}
              mainClassName="flex items-end px-2 sm:px-2 md:px-3 text-yellow-300 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
          {username}!
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 shadow-md">
            {error}
          </div>
        )}

        <div className="flex justify-center items-end mb-6">
          <p className="text-gray-800 text-lg font-medium">
            What would you like to eat today?
          </p>
        </div>

        {/* Use SearchBar without filter button */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory=""
          setFilterCategory={() => {}}
          minPrice=""
          setMinPrice={() => {}}
          maxPrice=""
          setMaxPrice={() => {}}
          showFilterButton={false}
          placeholder="Search restaurants..." // Custom placeholder for restaurant search
        />

        <section className="mt-8">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">
            Available Restaurants
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
