import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Sidebar from "../components/Sidebar";

const Home = () => {
  const [username, setUsername] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate(); // Initialize navigate

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

        if (data.user && data.user.name) {
          setUsername(data.user.name);
        } else {
          setError("User data is missing.");
        }
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
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError(error.message);
      }
    };

    fetchUser();
    fetchRestaurants();
  }, []);

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
        <h1 className="text-3xl font-bold text-yellow-700 mb-4">
          Welcome, {username ? username : "Guest"}! 🍽️
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

        <section className="mt-8">
          <h2 className="text-xl font-bold text-yellow-800 mb-4">
            🍕 Available Restaurants
          </h2>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.restaurant_id}
                  className="w-100 p-4 border border-yellow-300 rounded-lg bg-white shadow-lg hover:shadow-xl hover:bg-yellow-100 transition-all cursor-pointer"
                  onClick={() => navigate(`/menu/${restaurant.restaurant_id}`)}
                >
                  {/* Placeholder for restaurant image */}
                  <div className="h-40 bg-yellow-200 rounded-t-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-600 text-lg font-semibold">
                      🍽️ Image
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {restaurant.restaurant_name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {restaurant.restaurant_address}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 text-center py-8">
              No restaurants available at the moment. 🍽️
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
