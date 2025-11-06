/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { API_URL } from "../../../config/api";

const RestaurantHeader = ({ restaurant }) => {
  const [averageRating, setAverageRating] = useState(null);
  const [isLoadingRating, setIsLoadingRating] = useState(true);

  useEffect(() => {
    const fetchRestaurantRating = async () => {
      if (!restaurant?.restaurant_id) {
        setIsLoadingRating(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoadingRating(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/restaurant/detail-rate?restaurantId=${restaurant.restaurant_id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAverageRating(data.data?.averageRating || null);
        }
      } catch (error) {
        console.error("Error fetching restaurant rating:", error);
      } finally {
        setIsLoadingRating(false);
      }
    };

    fetchRestaurantRating();
  }, [restaurant?.restaurant_id]);

  if (!restaurant) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-amber-500 to-amber-400 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20px 20px, white 2px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative px-6 md:px-10 lg:px-16 py-8 md:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Restaurant Image */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-white/20 rounded-full blur-lg"></div>
                <img
                  src={
                    restaurant.restaurant_image
                      ? `${API_URL}/restaurant/uploads/restaurant/${restaurant.restaurant_image}`
                      : "https://via.placeholder.com/150x150?text=Restaurant"
                  }
                  alt={restaurant.restaurant_name}
                  className="relative w-28 h-28 md:w-36 md:h-36 object-cover rounded-full border-4 border-white shadow-xl"
                />
                {/* Rating Badge */}
                {!isLoadingRating &&
                  averageRating !== null &&
                  averageRating > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-3 py-1.5 shadow-lg border-2 border-amber-400">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-500 text-sm" />
                        <span className="text-base font-bold text-gray-800">
                          {averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="flex-grow text-center md:text-left text-white">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                {restaurant.restaurant_name}
              </h1>
              {restaurant.restaurant_address && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm md:text-base text-white/95 font-medium">
                    {restaurant.restaurant_address}
                  </p>
                </div>
              )}

              {/* Additional Info Pills */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
                <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/30">
                  <span className="text-xs md:text-sm font-semibold">
                    🍽️ Fine Dining
                  </span>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/30">
                  <span className="text-xs md:text-sm font-semibold">
                    ⚡ Fast Delivery
                  </span>
                </div>
                {isLoadingRating ? (
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/30">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      <span className="text-xs md:text-sm font-semibold">
                        Loading...
                      </span>
                    </div>
                  </div>
                ) : averageRating === null || averageRating === 0 ? (
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/30">
                    <span className="text-xs md:text-sm font-semibold">
                      ⭐ New Restaurant
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            fill="#fff"
          />
        </svg>
      </div>
    </div>
  );
};

export default RestaurantHeader;
