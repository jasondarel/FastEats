/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/Orders/OrderListHeader.jsx
import React from "react";

const OrderListHeader = () => {
  return (
    <div className="w-full max-w-6xl sticky top-0 py-4 z-5 bg-yellow-50">
      <div className="bg-yellow-500 rounded-lg shadow-lg py-4 px-6">
        <h2 className="text-4xl font-extrabold text-center text-white">
          Order List
        </h2>
      </div>
      <div className="h-1 bg-yellow-400 w-full max-w-6xl mt-4 rounded-full"></div>
    </div>
  );
};

export default OrderListHeader;
