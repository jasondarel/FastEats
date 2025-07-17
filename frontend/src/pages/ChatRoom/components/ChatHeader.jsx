/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { FaArrowLeft, FaStore, FaPhoneAlt } from "react-icons/fa";
import StatusBadge from "../../../components/StatusBadge";
import { IoMdPerson } from "react-icons/io";

const ChatHeader = ({
  onBackClick,
  orderDetails,
  currentOrderDetails,
  chatId,
  formatPrice,
  user
}) => {
  console.log("ChatHeader orderDetails:", orderDetails);
  console.log("ChatHeader currentOrderDetails:", currentOrderDetails);
  console.log("ChatHeader User: ", user);
  const handleCallClick = () => {
    alert("Calling restaurant... (Demo feature)");
  };

  return (
    <div className="bg-white shadow-sm border-b p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back to chat list"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden">
                {user.role === "user" ? (
                  orderDetails.restaurantImage ? (
                    <img
                      src={orderDetails.restaurantImage}
                      alt={
                        orderDetails.restaurantName ||
                        "Restaurant Profile"
                      }
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <FaStore className="text-yellow-600 flex" />
                  )
                ) : (
                  orderDetails.customerImage ? (
                    <img
                      src={orderDetails.customerImage}
                      alt={orderDetails.customerName || "Customer Profile"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <IoMdPerson className="text-yellow-600 flex" />
                  )
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">
                  {orderDetails.restaurantName ||
                    orderDetails.customerName ||
                    "Restaurant"}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Order #{orderDetails.orderId || chatId || "Unknown"}
                  </span>
                  <StatusBadge
                    status={
                      currentOrderDetails?.orderDetails?.status || "Unknown"
                    }
                    className="text-xs px-2 py-1 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right text-sm">
              <div className="text-gray-600">
                {orderDetails.itemCount || 0} item
                {(orderDetails.itemCount || 0) !== 1 ? "s" : ""}
              </div>
              <div className="font-semibold text-gray-800">
                {formatPrice(orderDetails.totalPrice)}
              </div>
            </div>

            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={handleCallClick}
              aria-label="Call restaurant"
            >
              <FaPhoneAlt className="text-yellow-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
