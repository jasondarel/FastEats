import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { jwtDecode } from "jwt-decode";

const ManageRestaurant = () => {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to manage a restaurant");
      navigate("/");
      return;
    }

    const decodedToken = jwtDecode(token);
    if (decodedToken.role !== "seller") {
      alert("Only sellers can manage a restaurant");
      navigate("/");
      return;
    }

    const fetchRestaurantData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/restaurant/restaurant",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const { restaurant } = response.data;
        if (restaurant) {
          setRestaurantName(restaurant.restaurant_name);
          setRestaurantAddress(restaurant.restaurant_address);
        } else {
          alert("Restaurant data not found.");
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred while fetching the restaurant details.");
      }
    };

    fetchRestaurantData();
  }, [navigate]);

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    setErrors({});

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your restaurant");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/restaurant/restaurant",
        { restaurantName, restaurantAddress },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message || "Successfully updated the restaurant!");
      navigate("/");
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response?.data?.error ||
        "An error occurred while updating the restaurant.";
      alert(errMsg);
    }
  };

  return (
    <div className="flex ml-0 md:ml-64">
      <Sidebar />
      <main className="flex-1 p-5 bg-yellow-100 min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-lg p-8 bg-white shadow-xl rounded-xl">
          <h2 className="text-3xl font-bold text-center text-yellow-600 mb-6">
            Manage Your Restaurant
          </h2>
          <form onSubmit={handleUpdateRestaurant} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                placeholder="Enter your restaurant name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.restaurantName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.restaurantName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Restaurant Address
              </label>
              <input
                type="text"
                placeholder="Enter your restaurant address"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.restaurantAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.restaurantAddress}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-yellow-500 text-white text-lg font-semibold rounded-lg hover:bg-yellow-600 hover:cursor-pointer transition"
            >
              Update Restaurant
            </button>
          </form>
        </div>

        {/* Floating My Menu Button */}
        <a
          href="../my-menu"
          className="fixed bottom-10 right-10 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:bg-yellow-600 transition"
        >
          My Menu
        </a>
      </main>
    </div>
  );
};

export default ManageRestaurant;
