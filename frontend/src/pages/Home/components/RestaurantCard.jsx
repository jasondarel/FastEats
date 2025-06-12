import React from "react";
import useLocation from "../hooks/useLocation";
import {
  FaGlobeAmericas,
  FaCity,
  FaBuilding,
  FaTree,
  FaHome,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const RestaurantCard = ({ restaurant, onClick }) => {
  const locationData = {
    province_id: restaurant.restaurant_province,
    city_id: restaurant.restaurant_city,
    district_id: restaurant.restaurant_district,
    village_id: restaurant.restaurant_village,
    streetAddress: restaurant.restaurant_address,
  };

  const { fullAddress, isLoading: isLoadingAddress } =
    useLocation(locationData);

  return (
    <div
      className="w-full border border-yellow-300 rounded-lg bg-white shadow-lg hover:shadow-xl hover:bg-yellow-100 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="h-36 sm:h-40 md:h-44 lg:h-48 w-full bg-yellow-200 rounded-t-lg flex items-center justify-center overflow-hidden">
        {restaurant.restaurant_image ? (
          <img
            className="w-full h-full object-cover rounded-t-lg"
            src={`http://localhost:5000/restaurant/uploads/restaurant/${restaurant.restaurant_image}`}
            alt={restaurant.restaurant_name}
          />
        ) : (
          <span className="text-gray-600 text-lg font-semibold">Image</span>
        )}
      </div>
      <div className="p-3 md:p-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900">
          {restaurant.restaurant_name}
        </h3>
        <div className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
          {isLoadingAddress ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
              <span>Loading address...</span>
            </div>
          ) : (
            <p className="line-clamp-2">{fullAddress}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
