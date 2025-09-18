/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { IoTimeOutline } from "react-icons/io5";

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
        <IoTimeOutline className="mr-2" />
        <span className="font-medium">
          Order processed at {formatDate(createdAt)}
        </span>
      </div>
    </div>
  );
};

export default OrderTimestamp;
