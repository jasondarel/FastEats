import React from "react";

const MenuImage = ({ menu }) => {
  return (
    <img
      src={
        menu.menu_image
          ? `http://localhost:5000/restaurant/uploads/menu/${menu.menu_image}`
          : "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
      }
      alt={menu.menu_name || "Menu item"}
      className="w-full h-64 object-contain rounded-lg shadow-md mb-4"
    />
  );
};

export default MenuImage;
