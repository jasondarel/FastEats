/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { API_URL } from "../../../config/api";

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, calculateAddOnsPrice, getItemTotalPrice }) => {
  const menu = item.menu || {};

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

  const addOnsPrice = calculateAddOnsPrice ? calculateAddOnsPrice(item) : 0;
  const itemTotalPrice = getItemTotalPrice ? getItemTotalPrice(item) : parseFloat(menu_price) + addOnsPrice;
  const totalPrice = itemTotalPrice * quantity;

  
  const getAddOnNames = () => {
    
    const addOns = item.addsOn;
    
    if (!addOns || !Array.isArray(addOns) || addOns.length === 0) {
      return "";
    }

    const names = [];
    
    addOns.forEach(addOn => {
      if (addOn.adds_on_name) {
        names.push(addOn.adds_on_name);
      } else if (addOn.items && Array.isArray(addOn.items)) {
        addOn.items.forEach(addOnItem => {
          if (addOnItem.adds_on_name) {
            names.push(addOnItem.adds_on_name);
          }
        });
      } else if (addOn.name) {
        names.push(addOn.name);
      }
    });

    return names.length > 0 ? names.join(", ") : "";
  };

  const addOnNames = getAddOnNames();

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
        {addOnNames && (
          <div className="text-sm text-gray-600 mt-1">
            {addOnNames}
          </div>
        )}
        {menu_size && (
          <div className="flex text-sm text-gray-600 mt-1">{menu_size}</div>
        )}
      </div>

      <div className="flex flex-col items-end">
        <div className="font-semibold text-yellow-600">
          Rp {totalPrice.toLocaleString()}
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