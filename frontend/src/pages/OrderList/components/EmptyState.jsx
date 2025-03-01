// src/components/UI/EmptyState.jsx
import React from "react";

const EmptyState = ({ message = "No data found" }) => {
  return (
    <div className="flex justify-center items-center w-full h-32">
      <div className="bg-yellow-100 p-6 rounded-lg shadow-md">
        <p className="text-xl text-yellow-700">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
