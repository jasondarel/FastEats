import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const BecomeSeller = () => {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [errors, setErrors] = useState({});

  const handleBecomeSeller = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to become a seller");
        return;
      }

      const payload = {
        restaurantName,
        restaurantAddress,
      };

      const response = await axios.post(
        "http://localhost:5000/user/become-seller",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(response.data.message || "Successfully became a seller!");
    } catch (error) {
      console.error(error);
      const errMsg =
        error.response?.data?.error ||
        "An error occurred while processing your request.";
      alert(errMsg);
    }
  };

  return (
    <div className="flex ml-64">
      <Sidebar />
      <main className="flex-1 p-5 bg-yellow-100 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Become Seller
          </h2>
          <form onSubmit={handleBecomeSeller} className="space-y-4">
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
              Become Seller
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BecomeSeller;
