import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const Home = () => {
  const [username, setUsername] = useState("");
  const [restaurants, setRestaurants] = useState([]); // 🔹 State to store restaurants

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5002/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsername(data.user.name);
        } else {
          console.error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:5002/restaurants");
        if (response.ok) {
          const data = await response.json();
          setRestaurants(data.restaurants); // 🔹 Store restaurants in state
        } else {
          console.error("Failed to fetch restaurants");
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };

    fetchUser();
    fetchRestaurants(); // 🔹 Fetch restaurants
  }, []);

  return (
    <div className="flex ml-64">
      <Sidebar />
      <main className="flex-1 p-5">
        <h1 className="text-2xl font-bold">
          Welcome {username ? username : "Guest"}!
        </h1>
        <p className="mt-2 text-gray-700">This is the home page content.</p>

        {/* 🔹 Display restaurant list */}
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
