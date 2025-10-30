/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { FaDoorOpen, FaDoorClosed } from "react-icons/fa";

const RestaurantStatusToggle = ({ isOpen, onToggle }) => {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm gap-6">
          {/* Status Display */}
          <div className="flex items-center">
            <div
              className={`p-3 rounded-full mr-4 ${
                isOpen ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isOpen ? (
                <FaDoorOpen className="text-green-600 text-2xl" />
              ) : (
                <FaDoorClosed className="text-red-600 text-2xl" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-800">
                Restaurant Status
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                ></div>
                <p
                  className={`text-sm font-medium ${
                    isOpen ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isOpen ? "Currently Accepting Orders" : "Closed for Orders"}
                </p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-amber-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Your restaurant will only be visible to customers when it's
                  open. Closing your restaurant will hide it from the
                  marketplace until you open it again.
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className={`hover:cursor-pointer w-full px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
              isOpen
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            }`}
          >
            {isOpen ? "Close Restaurant" : "Open Restaurant"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantStatusToggle;
