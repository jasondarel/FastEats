import React from "react";
import RestaurantCard from "./RestaurantCard";

const RestaurantGrid = ({ restaurants, onRestaurantClick }) => {
  return (
    <section className="mt-8 max-w-8xl mx-auto">
      <h2 className="text-lg md:text-xl font-bold text-yellow-800 mb-4">
        Available Restaurants
      </h2>
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.restaurant_id}
              restaurant={restaurant}
              onClick={() => onRestaurantClick(restaurant.restaurant_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-600 text-center py-8">
          No open restaurants match your search. 🍽️
        </div>
      )}
    </section>
  );
};

export default RestaurantGrid;
