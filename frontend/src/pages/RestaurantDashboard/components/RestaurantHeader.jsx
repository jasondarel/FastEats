/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config/api";

const RestaurantHeader = ({ restaurantInfo }) => {
  const navigate = useNavigate();

  const handleManageRestaurant = () => {
    navigate("../manage-restaurant");
  };

  const handleViewOrderHistory = () => {
    navigate("../order-list");
  };

  return (
    <div className="flex flex-col md:flex-row p-6 border-b border-amber-200">
      <div className="md:w-1/3 mb-4 md:mb-0">
        <img
          src={`${API_URL}/restaurant/uploads/restaurant/${restaurantInfo.image}`}
          alt={restaurantInfo.name}
          className="rounded-lg shadow-md w-full h-64 object-cover"
        />
      </div>
      <div className="md:w-2/3 md:pl-8 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-amber-900 mb-2">
          {restaurantInfo.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-600 font-medium">Total Orders</p>
            <p className="text-3xl font-bold text-amber-800">
              {restaurantInfo.totalOrders}
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-600 font-medium">Total Items</p>
            <p className="text-3xl font-bold text-amber-800">
              {restaurantInfo.totalItems}
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
            <p className="text-sm text-amber-600 font-medium">
              Obtained Revenue
            </p>
            <p className="text-3xl font-bold text-amber-800">
              {restaurantInfo.totalRevenue}
            </p>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleManageRestaurant}
            className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <FileText className="mr-2" size={18} />
            Manage Restaurant
          </button>
          <button
            onClick={handleViewOrderHistory}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="mr-2" size={18} />
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHeader;
