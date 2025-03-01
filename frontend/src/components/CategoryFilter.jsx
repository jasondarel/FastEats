import React from "react";

const categories = ["All", "Food", "Drink", "Dessert", "Others"];

const CategoryFilter = ({ filterCategory, setFilterCategory }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((category) => (
        <button
          key={category}
          className={`px-4 py-2 rounded-lg font-semibold cursor-pointer ${
            filterCategory === category
              ? "bg-yellow-600 text-white"
              : "bg-gray-200 text-black"
          }`}
          onClick={() => setFilterCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
