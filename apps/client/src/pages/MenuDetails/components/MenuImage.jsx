/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { API_URL } from "../../../config/api";

const MenuImage = ({ menu }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden group shadow-lg">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

      <img
        src={
          menu.menu_image
            ? `${API_URL}/restaurant/uploads/menu/${menu.menu_image}`
            : "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
        }
        alt={menu.menu_name || "Menu item"}
        className="w-full h-64 md:h-96 lg:h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-500"
      />

      {/* Category badge */}
      {menu.menu_category && (
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-block bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            {menu.menu_category}
          </span>
        </div>
      )}

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-orange-400 to-yellow-400 rounded-bl-full"></div>
      </div>
    </div>
  );
};

export default MenuImage;
