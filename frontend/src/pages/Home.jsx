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
      <div className="flex ml-64">
        <Sidebar />
        <main className="flex-1 p-5">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex ml-64">
      <Sidebar />
      <main className="flex-1 p-5">
        <h1 className="text-2xl font-bold mb-4">
          Welcome {username ? username : "Guest"}!
        </h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-700 text-lg">What would you like to eat?</p>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">Available Restaurants</h2>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.restaurant_id}
                  className="w-100 p-4 border rounded-lg shadow-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/menu/${restaurant.restaurant_id}`)} // Navigate to MenuPage
                >
                  {/* Add a placeholder image for now, can replace with actual images later */}
                  <div className="h-40 bg-gray-300 rounded-t-lg mb-4"></div>

                  <h3 className="text-lg font-semibold text-gray-800">
                    {restaurant.restaurant_name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {restaurant.restaurant_address}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No restaurants available at the moment.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
