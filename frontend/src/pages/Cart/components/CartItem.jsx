/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { API_URL } from "../../../config/api";

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const menu = item.menu || {};
  console.log("Menu props:", menu);

  const {
    menu_name = menu.menu_name || item.name || "Menu Item",
    menu_price = menu.menu_price || item.menu_price || 0,
    quantity = item.total_quantity || 1,
    note = item.note || "",
    menu_image_url = menu.menu_image ||
      item.menu_image_url ||
      "/placeholder-food.png",
    menu_size = menu.size || item.menu_size || "",
  } = item;

  return (
    <div className="flex items-start p-3 border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 transition">
      <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
        <img
          src={`${API_URL}/restaurant/uploads/menu/${menu_image_url}`}
          alt={menu_name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-food.png";
          }}
        />
      </div>

      <div className="flex-1 ml-3">
        <h3 className="font-medium">{menu_name}</h3>
        {menu_size && (
          <div className="flex text-sm text-gray-600">{menu_size}</div>
        )}
        {note && (
          <div className="text-xs text-gray-500 mt-1 italic">Note: {note}</div>
        )}
      </div>

      <div className="flex flex-col items-end">
        <div className="font-semibold text-yellow-600">
          Rp {(menu_price * quantity).toLocaleString()}
        </div>

        <div className="flex items-center mt-2">
          <button
            onClick={onRemoveItem}
            className="text-red-500 hover:text-red-700 mr-3"
            aria-label="Remove item"
          >
            <FaTrash />
          </button>

          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              onClick={() => onUpdateQuantity(quantity - 1)}
              className="px-2 py-1 text-gray-500 hover:bg-gray-100"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <FaMinus size={10} />
            </button>

            <span className="px-2 text-sm font-medium min-w-[24px] text-center">
              {quantity}
            </span>

            <button
              onClick={() => onUpdateQuantity(quantity + 1)}
              className="px-2 py-1 text-gray-500 hover:bg-gray-100"
              aria-label="Increase quantity"
            >
              <FaPlus size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
