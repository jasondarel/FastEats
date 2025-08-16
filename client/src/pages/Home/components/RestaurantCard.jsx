import React, { useState, useEffect } from "react";
import useLocation from "../hooks/useLocation";
import {
  FaMapMarkerAlt,
  FaUtensils,
  FaStar,
  FaGlobeAmericas,
  FaCity,
  FaHome,
  FaBuilding,
  FaTree,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { API_URL } from "../../../config/api";

const RestaurantCard = ({ restaurant, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [isLoadingRating, setIsLoadingRating] = useState(true);

  const locationData = {
    province_id: restaurant.restaurant_province,
    city_id: restaurant.restaurant_city,
    district_id: restaurant.restaurant_district,
    village_id: restaurant.restaurant_village,
    streetAddress: restaurant.restaurant_address,
  };

  const { currentAddress, isLoading: isLoadingAddress } = useLocation(
    locationData,
    isExpanded
  );

  useEffect(() => {
    const fetchRestaurantRating = async () => {
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
          setAverageRating(data.data.averageRating);
        }
      } catch (error) {
        console.error("Error fetching restaurant rating:", error);
      } finally {
        setIsLoadingRating(false);
      }
    };

    if (restaurant.restaurant_id) {
      fetchRestaurantRating();
    }
  }, [restaurant.restaurant_id]);

  const handleCardClick = (e) => {
    if (e.target.closest(".toggle-button")) {
      return;
    }
    onClick();
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="group w-full bg-white rounded-xl shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100"
      onClick={handleCardClick}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {restaurant.restaurant_image ? (
          <>
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              src={`${API_URL}/restaurant/uploads/restaurant/${restaurant.restaurant_image}`}
              alt={restaurant.restaurant_name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-yellow-300 flex items-center justify-center">
            <div className="text-center">
              <FaUtensils className="text-4xl text-orange-600 mb-2 mx-auto" />
              <span className="text-orange-700 text-sm font-medium">
                No Image
              </span>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            Restaurant
          </span>
        </div>

        {/* Updated rating display */}
        {!isLoadingRating && averageRating !== null && averageRating > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <FaStar className="text-yellow-500 text-xs" />
            <span className="text-xs font-semibold text-gray-800">
              {averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-200 line-clamp-1">
          {restaurant.restaurant_name}
        </h3>

        <div className="text-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Location</span>
            <button
              className="toggle-button flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 transition-colors"
              onClick={handleToggle}
            >
              {isExpanded ? "Less" : "More"}
              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          {isLoadingAddress ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
              <span className="text-gray-500">Loading address...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {currentAddress.split("\n").map((line, index) => {
                const getIcon = () => {
                  if (index === 0)
                    return (
                      <FaGlobeAmericas className="text-blue-500 flex-shrink-0" />
                    );
                  if (index === 1)
                    return <FaCity className="text-green-500 flex-shrink-0" />;
                  if (isExpanded && index === 2)
                    return (
                      <FaBuilding className="text-purple-500 flex-shrink-0" />
                    );
                  if (isExpanded && index === 3)
                    return <FaTree className="text-green-600 flex-shrink-0" />;
                  if (
                    (!isExpanded && index === 2) ||
                    (isExpanded && index === 4)
                  )
                    return <FaHome className="text-orange-500 flex-shrink-0" />;
                  return null;
                };

                return (
                  <div key={index} className="flex items-start gap-3">
                    {getIcon()}
                    <span
                      className={`
                      ${
                        index === 0 ? "font-semibold text-gray-800 text-sm" : ""
                      }
                      ${index === 1 ? "font-medium text-gray-700 text-sm" : ""}
                      ${
                        index === 2
                          ? isExpanded
                            ? "font-medium text-gray-600 text-sm"
                            : "text-gray-600 text-xs"
                          : ""
                      }
                      ${index === 3 ? "font-medium text-gray-600 text-sm" : ""}
                      ${index === 4 ? "text-gray-600 text-xs" : ""}
                    `}
                    >
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {restaurant.cuisine_type && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
              {restaurant.cuisine_type}
            </span>
          </div>
        )}
      </div>

      <div className="h-1 bg-gradient-to-r from-orange-400 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </div>
  );
};

export default RestaurantCard;