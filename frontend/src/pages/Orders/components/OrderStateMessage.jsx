/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import LoadingState from "../../../components/LoadingState";

const OrderStateMessage = ({ type, message, subMessage }) => {
  switch (type) {
    case "loading":
      return <LoadingState />;
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
