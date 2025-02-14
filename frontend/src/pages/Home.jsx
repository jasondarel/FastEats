import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const Home = () => {
  const [username, setUsername] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      console.log("Token in localStorage:", token); // Debugging

      if (!token) {
        setError("No token found. Please log in.");
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

        console.log("Response status:", response.status); // Debugging

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user profile. Status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Fetched user data:", data); // Debugging

        if (data.success && data.data.user && data.data.user.name) {
          setUsername(data.data.user.name);
        } else {
          setError("User data is missing.");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError(error.message);
      }
    };

    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:5000/restaurants");

        if (!response.ok) {
          throw new Error("Failed to fetch restaurants.");
        }

        const data = await response.json();
        setRestaurants(data.data.restaurants);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };

    fetchUser();
    fetchRestaurants();
  }, []);

  return (
    <div className="flex ml-64">
      <Sidebar />
      <main className="flex-1 p-5">
        <h1 className="text-2xl font-bold">
          Welcome {username ? username : "Guest"}!
        </h1>
        {error && <p className="text-red-500">{error}</p>}
        <p className="mt-2 text-gray-700">What would you like to eat?</p>

        <h2 className="mt-5 text-xl font-bold">Restaurants:</h2>
        <ul className="mt-2">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <li key={restaurant.restaurant_id} className="p-3 border-b">
                <h3 className="text-lg font-semibold">
                  {restaurant.restaurant_name}
                </h3>
                <p className="text-gray-600">{restaurant.restaurant_address}</p>
              </li>
            ))
          ) : (
            <p>No restaurants available.</p>
          )}
        </ul>
      </main>
    </div>
  );
};

export default Home;
