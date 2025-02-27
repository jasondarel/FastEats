import React from "react";

// StatusBadge component for consistent order status styling
const StatusBadge = ({ status, className = "" }) => {
  // Function to determine status colors based on order status
  const getStatusStyles = (status) => {
    switch (status) {
      case "Waiting":
        return "bg-yellow-200 text-yellow-800"; // Yellow for waiting
      case "Preparing":
        return "bg-blue-200 text-blue-800"; // Blue for preparing
      case "Completed":
        return "bg-green-300 text-green-800"; // Green for completed
      case "Cancelled":
        return "bg-red-200 text-red-800"; // Red for cancelled
      case "Delivering":
        return "bg-amber-200 text-amber-800"; // Amber for delivering
      case "Pending":
        return "bg-purple-200 text-purple-800"; // Purple for pending
      default:
        return "bg-gray-200 text-gray-800"; // Gray for any other status
    }
  };

  return (
    <div className={`${getStatusStyles(status)} ${className}`}>
      {status || "Unknown Status"}
    </div>
  );
};

export default StatusBadge;
