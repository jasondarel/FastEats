import React from "react";

const StatusBadge = ({ status, className = "" }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Waiting":
        return "bg-yellow-200 text-yellow-800";
      case "Preparing":
        return "bg-blue-200 text-blue-800";
      case "Completed":
        return "bg-green-300 text-green-800";
      case "Cancelled":
        return "bg-red-200 text-red-800";

      case "Pending":
        return "bg-purple-200 text-purple-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className={`${getStatusStyles(status)} ${className}`}>
      {status || "Unknown Status"}
    </div>
  );
};

export default StatusBadge;
