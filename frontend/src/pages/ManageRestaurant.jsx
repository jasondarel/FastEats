import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { jwtDecode } from "jwt-decode";
import { FaUtensils, FaMapMarkerAlt, FaSave } from "react-icons/fa"; // Import icons

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
    <div
      className="flex w-screen min-h-screen bg-yellow-100"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/manageresto.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Sidebar />
      <main className="flex-1 flex justify-center items-center p-5">
        <div className="w-full max-w-lg p-8 bg-white shadow-xl rounded-xl">
          <h2 className="text-3xl font-bold text-center text-yellow-600 mb-6 flex items-center justify-center">
            <FaUtensils className="mr-2" /> Manage Your Restaurant
          </h2>
          <form onSubmit={handleUpdateRestaurant} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Restaurant Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
                <FaUtensils className="ml-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter your restaurant name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  required
                  className="w-full p-3 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Restaurant Address
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
                <FaMapMarkerAlt className="ml-3 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter your restaurant address"
                  value={restaurantAddress}
                  onChange={(e) => setRestaurantAddress(e.target.value)}
                  required
                  className="w-full p-3 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-yellow-500 text-white text-lg font-semibold rounded-lg hover:bg-yellow-600 transition flex items-center justify-center"
            >
              <FaSave className="mr-2" /> Update Restaurant
            </button>
          </form>
        </div>

        {/* Floating My Menu Button */}
        <a
          href="../my-menu"
          className="fixed bottom-10 right-10 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:bg-yellow-600 transition flex items-center"
        >
          <FaUtensils className="mr-2" /> My Menu
        </a>
      </main>
    </div>
  );
};

export default ManageRestaurant;
