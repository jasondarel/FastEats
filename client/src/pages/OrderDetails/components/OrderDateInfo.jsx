/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const OrderDateInfo = ({ createdAt, updatedAt }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-amber-50 p-4 rounded-lg">
      <div className="border-l-4 border-amber-400 pl-4">
        <div className="text-sm text-amber-700 font-medium">Order Date</div>
        <div className="text-lg">{formatDate(createdAt)}</div>
      </div>
      <div className="border-l-4 border-amber-400 pl-4">
        <div className="text-sm text-amber-700 font-medium">Last Updated</div>
        <div className="text-lg">{formatDate(updatedAt)}</div>
      </div>
    </div>
  );
};

export default OrderDateInfo;
