/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { FaDoorOpen, FaDoorClosed } from "react-icons/fa";

const RestaurantStatusToggle = ({ isOpen, onToggle }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center">
          {isOpen ? (
            <FaDoorOpen className="text-green-500 text-xl mr-3" />
          ) : (
            <FaDoorClosed className="text-red-500 text-xl mr-3" />
          )}
          <div>
            <h3 className="font-medium">Restaurant Status</h3>
            <p
              className={`text-sm ${
                isOpen ? "text-green-600" : "text-red-600"
              }`}
            >
              {isOpen ? "Currently Open" : "Currently Closed"}
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded-lg text-white font-medium transition ${
            isOpen
              ? "bg-red-500 hover:bg-red-600 hover:cursor-pointer"
              : "bg-green-500 hover:bg-green-600 hover:cursor-pointer"
          }`}
        >
          {isOpen ? "Close Restaurant" : "Open Restaurant"}
        </button>
      </div>
    </div>
  );
};

export default RestaurantStatusToggle;
