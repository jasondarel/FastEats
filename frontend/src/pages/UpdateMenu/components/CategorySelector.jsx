import React from "react";

const CategorySelector = ({ selectedCategory, onCategorySelect }) => {
  //icons
  const foodIcon = "/icons/foods-icon.png";
  const drinkIcon = "/icons/drinks-icon.png";
  const dessertIcon = "/icons/dessert-icon.png";
  const otherIcon = "/icons/other-icon.png";

  const handleClick = (category) => {
    onCategorySelect(category);
  };

  return (
    <div className="my-4">
      <label className="font-semibold text-sm">
        Change Category<span className="text-pink-600">*</span>
      </label>
      <div className="grid grid-cols-2 gap-0 mt-1 md:grid-cols-4">
        <div
          className={`border border-yellow-400 rounded-tl-md p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition md:rounded-l ${
            selectedCategory === "Food"
              ? "bg-yellow-500"
              : "hover:bg-yellow-400"
          }`}
          onClick={() => handleClick("Food")}
        >
          <img
            src={foodIcon}
            alt="Foods"
            className="mb-2 h-10 w-10 object-contain"
          />
          Foods
        </div>

        {/* Kategori Drinks */}
        <div
          className={`border rounded-tr-md border-yellow-400 p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition md:rounded-none ${
            selectedCategory === "Drink"
              ? "bg-yellow-500"
              : "hover:bg-yellow-400"
          }`}
          onClick={() => handleClick("Drink")}
        >
          <img
            src={drinkIcon}
            alt="Drinks"
            className="mb-2 h-10 w-10 object-contain"
          />
          Drinks
        </div>

        {/* Kategori Dessert */}
        <div
          className={`border rounded-bl-md border-yellow-400 p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition md:rounded-none ${
            selectedCategory === "Dessert"
              ? "bg-yellow-500"
              : "hover:bg-yellow-400"
          }`}
          onClick={() => handleClick("Dessert")}
        >
          <img
            src={dessertIcon}
            alt="Dessert"
            className="mb-2 h-10 w-10 object-contain"
          />
          Dessert
        </div>

        {/* Kategori Other */}
        <div
          className={`border border-yellow-400 rounded-br-md p-4 text-center cursor-pointer flex flex-col items-center justify-center h-full group transition md:rounded-r ${
            selectedCategory === "Others"
              ? "bg-yellow-500"
              : "hover:bg-yellow-400"
          }`}
          onClick={() => handleClick("Others")}
        >
          <img
            src={otherIcon}
            alt="Other"
            className="mb-2 h-10 w-10 object-contain"
          />
          Other
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
