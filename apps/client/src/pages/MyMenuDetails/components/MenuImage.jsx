/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { API_URL } from "../../../config/api";

const MenuImage = ({ menu }) => {
  return (
    <img
      src={
        menu.menu_image
          ? `${API_URL}/restaurant/uploads/menu/${menu.menu_image}`
          : "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
      }
      alt={menu.menu_name || "Menu item"}
      className="w-full h-64 object-contain rounded-lg shadow-md mb-4"
    />
  );
};

export default MenuImage;
