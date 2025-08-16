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
    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 mb-6 shadow-sm border border-yellow-200">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <img
            src={
              restaurant.restaurant_image
                ? `${API_URL}/restaurant/uploads/restaurant/${restaurant.restaurant_image}`
                : "https://via.placeholder.com/150x150?text=Restaurant"
            }
            alt={restaurant.restaurant_name}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-yellow-300 shadow-md"
          />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-800 mb-2">
            {restaurant.restaurant_name}
          </h2>
          {restaurant.restaurant_address && (
            <p className="text-gray-600 mb-1">
              📍 {restaurant.restaurant_address}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          {isLoadingRating ? (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          ) : averageRating !== null && averageRating > 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md border border-yellow-200">
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                <span className="text-lg font-bold text-gray-800">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <FaStar className="text-gray-400" />
                <span className="text-sm text-gray-500">No ratings</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantHeader;