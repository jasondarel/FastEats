// components/MenuItem.jsx
import React from "react";
import { API_URL } from "../../../config/api";

const MenuItem = ({ item }) => {
  return (
    <div
      className={`rounded-xl shadow-md border transition-all duration-300 
                hover:shadow-lg cursor-pointer overflow-hidden
                ${
                  item.is_available
                    ? "bg-yellow-100 border-yellow-300 hover:bg-yellow-400 hover:border-yellow-800"
                    : "bg-gray-100 border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                }`}
    >
      <div className="relative">
        <img
          src={
            item.menu_image
              ? `${API_URL}/restaurant/uploads/menu/${item.menu_image}`
              : "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
          }
          alt={item.menu_name}
          className={`w-full h-50 object-cover rounded-t-xl ${
            !item.is_available && "opacity-50"
          }`}
        />
        {!item.is_available && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            Unavailable
          </div>
        )}
      </div>
      <div className="p-5">
        <h3
          className={`text-xl font-bold ${
            item.is_available ? "text-yellow-800" : "text-gray-500"
          }`}
        >
          {item.menu_name}
        </h3>
        <p className="text-sm text-gray-500 italic">{item.menu_category}</p>
        <p
          className={`mt-2 ${
            item.is_available ? "text-gray-700" : "text-gray-500"
          }`}
        >
          Rp {item.menu_price}
        </p>
      </div>
    </div>
  );
};

export default MenuItem;
