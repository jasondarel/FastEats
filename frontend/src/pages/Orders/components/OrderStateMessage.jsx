import React from "react";

const OrderStateMessage = ({ type, message, subMessage }) => {
  switch (type) {
    case "loading":
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent mb-2"></div>
          <p className="text-yellow-600 font-medium">
            {message || "Loading orders..."}
          </p>
        </div>
      );
    case "error":
      return (
        <div className="text-center py-8 text-red-500">
          <p className="font-medium mb-2">
            {message || "Error loading orders"}
          </p>
          <p className="text-sm">{subMessage}</p>
        </div>
      );
    case "empty":
      return (
        <div className="text-center py-8 text-gray-500">
          <p className="font-medium mb-2">{message || "No orders found"}</p>
          <p className="text-sm">
            {subMessage || "Your order history will appear here"}
          </p>
        </div>
      );
    default:
      return null;
  }
};

export default OrderStateMessage;
