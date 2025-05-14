import React from "react";
import { API_URL } from "../../../config/api";

const MenuItemCard = ({ item, onClick }) => {
  return (
    <div
      className="bg-yellow-100 rounded-xl shadow-md border border-yellow-300 
                 transition-all duration-300 hover:shadow-lg hover:bg-yellow-400 
                 hover:border-yellow-800 cursor-pointer"
      onClick={onClick}
    >
      <img
        src={
          item.menu_image
            ? `${API_URL}/restaurant/uploads/menu/${item.menu_image}`
            : "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
        }
        alt={item.menu_name}
        className="w-full h-50 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold text-yellow-800 group-hover:text-white">
          {item.menu_name}
        </h3>
        <p className="text-sm text-gray-500 italic group-hover:text-white">
          {item.menu_category}
        </p>
        <p className="text-gray-700 mt-2 group-hover:text-white">
          Rp {item.menu_price}
        </p>
      </div>
    </div>
  );
};

export default MenuItemCard;
