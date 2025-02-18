import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate once
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
      navigate("/"); // Redirect to home page if not logged in
      return;
    }

    const decodedToken = jwtDecode(token);
    console.log(decodedToken)
    // If the user is not a seller, redirect to the home page
    if (decodedToken.role !== "seller") {
      alert("Only sellers can manage a restaurant");
      navigate("/"); // Redirect to home page if not a seller
      return;
    }

    // Fetch restaurant data
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
        console.log(response.data); // Log the response to check its structure
        const { restaurant } = response.data;

        // Check if restaurant data exists and set state accordingly
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
    setErrors({}); // Clear previous errors

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update your restaurant");
      return;
    }

    try {
      const payload = {
        restaurantName,
        restaurantAddress,
      };

      const response = await axios.put(
        "http://localhost:5000/restaurant/restaurant",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message || "Successfully updated the restaurant!");
      navigate("/"); // Redirect to homepage or another page after update
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
      <main className="flex-1 p-5 bg-yellow-100 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Manage Restaurant
          </h2>
          <form onSubmit={handleUpdateRestaurant} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Restaurant Name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.restaurantName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.restaurantName}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Restaurant Address"
                value={restaurantAddress}
                onChange={(e) => setRestaurantAddress(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.restaurantAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.restaurantAddress}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
            >
              Update Restaurant
            </button>
          </form>
        </div>
        <a
          href="../my-menu"
          className="bg-sky-500 text-white p-5 rounded-2xl fixed bottom-30 left-120"
        >
          My Menu
        </a>
      </main>
    </div>
  );
};

export default ManageRestaurant;
