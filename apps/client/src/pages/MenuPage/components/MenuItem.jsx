/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// components/MenuItem.jsx
import React from "react";
import { API_URL } from "../../../config/api";

const MenuItem = ({ item }) => {
  return (
    <div
      className={`group relative rounded-2xl overflow-hidden transition-all duration-500 
                ${
                  item.is_available
                    ? "bg-white hover:shadow-2xl hover:-translate-y-2"
                    : "bg-gray-50"
                } shadow-lg cursor-pointer`}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 to-yellow-100">
        <img
          src={
            item.menu_image
              ? `${API_URL}/restaurant/uploads/menu/${item.menu_image}`
              : "https://www.pngall.com/wp-content/uploads/7/Dessert-PNG-Photo.png"
          }
          alt={item.menu_name}
          className={`w-full h-56 object-cover transition-all duration-500 
                    ${
                      item.is_available ? "group-hover:scale-110" : "opacity-50"
                    }`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Unavailable Badge */}
        {!item.is_available && (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            Out of Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category Badge */}
        <div className="mb-2">
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full
                          ${
                            item.is_available
                              ? "bg-amber-100 text-amber-600"
                              : "bg-gray-200 text-gray-500"
                          }`}
          >
            {item.menu_category}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-xl font-bold mb-2 line-clamp-2
                      ${item.is_available ? "text-gray-800" : "text-gray-500"}`}
        >
          {item.menu_name}
        </h3>

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-4">
          <div>
            <p
              className={`text-2xl font-bold
                        ${
                          item.is_available
                            ? "bg-amber-600 bg-clip-text text-transparent"
                            : "text-gray-400"
                        }`}
            >
              Rp {parseInt(item.menu_price).toLocaleString("id-ID")}
            </p>
          </div>

          {item.is_available && (
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Decorative corner */}
      {item.is_available && (
        <div className="absolute top-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-amber-400 to-yellow-400 rounded-bl-full"></div>
        </div>
      )}
    </div>
  );
};

export default MenuItem;
