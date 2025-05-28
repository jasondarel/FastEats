/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

const RestaurantCard = ({ restaurant, onClick }) => {
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
        <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
          {restaurant.restaurant_address}
        </p>
      </div>
    </div>
  );
};

export default RestaurantCard;
