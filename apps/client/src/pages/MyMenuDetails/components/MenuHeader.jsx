/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";

const MenuHeader = ({
  menu,
  onToggleAvailability,
  onShowEditForm,
  onDeleteMenu,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          {menu.menu_name || "Unnamed Dish"}
        </h1>
        <div className="mt-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              menu.is_available
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {menu.is_available ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onToggleAvailability(menu.is_available)}
          className={`px-4 py-2 rounded-md text-white transition-colors hover:cursor-pointer ${
            menu.is_available
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          Make {menu.is_available ? "Unavailable" : "Available"}
        </button>
        <button
          onClick={onShowEditForm}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors hover:cursor-pointer"
        >
          <FaRegEdit className="h-5 w-5" />
        </button>
        <button
          onClick={onDeleteMenu}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors hover:cursor-pointer"
        >
          <FaRegTrashAlt className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MenuHeader;
