import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { jwtDecode } from "jwt-decode";

const BecomeSeller = () => {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.role === "seller") {
          navigate("/manage-restaurant");
        }
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleBecomeSeller = async (e) => {
    e.preventDefault();
    setErrors({});

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to become a seller");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "user") {
        alert("Only users can become sellers");
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

      alert(
        response.data.message + " ..Please login again" ||
          "Successfully became a seller!"
      );
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          if (data.errors) {
            const validationErrors = Object.values(data.errors)
              .map((msg) => `• ${msg}`)
              .join("\n");
            alert(`Validation Error:\n${validationErrors}`);
          } else if (data.message) {
            alert(`Error: ${data.message}`);
          } else {
            alert("Invalid request. Please check your input.");
          }
        } else if (status === 401) {
          alert("Unauthorized! Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert(
            data.message ||
              "An unexpected error occurred. Please try again later."
          );
        }
      }
      window.location.reload();
    }
  };

  return (
    <div className="flex ml-64">
      <Sidebar />
      <main
        className="flex-1 p-5 min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.6)), url('/manageresto.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
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
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-0 focus:ring-2 focus:ring-yellow-500"
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
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-0 focus:ring-2 focus:ring-yellow-500"
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
