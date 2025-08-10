/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const OrderTimestamp = ({ createdAt }) => {
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
    <div className="mt-8 p-4 bg-amber-50 rounded-lg">
      <div className="flex items-center text-amber-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5 mr-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium">
          Order processed at {formatDate(createdAt)}
        </span>
      </div>
    </div>
  );
};

export default OrderTimestamp;
