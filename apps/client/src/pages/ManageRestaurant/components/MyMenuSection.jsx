/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { FaUtensils, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MyMenuSection = () => {
  const navigate = useNavigate();

  const handleNavigateToMenu = () => {
    navigate("../my-menu");
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm gap-3">
          {/* Menu Info Display */}
          <div className="flex items-center">
            <div className="p-2 rounded-full mr-3 bg-amber-100">
              <FaUtensils className="text-amber-600 text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-800">
                Menu Management
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Manage your restaurant's menu items
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-2.5 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-4 w-4 text-amber-400 mt-0.5"
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
              <div className="ml-2">
                <p className="text-xs text-amber-700">
                  View, add, edit, and manage all your menu items and
                  categories.
                </p>
              </div>
            </div>
          </div>

          {/* Navigate Button */}
          <button
            onClick={handleNavigateToMenu}
            className="hover:cursor-pointer w-full px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] bg-amber-500 hover:bg-amber-600 flex items-center justify-center gap-2"
          >
            <FaUtensils /> Go to My Menu <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyMenuSection;
