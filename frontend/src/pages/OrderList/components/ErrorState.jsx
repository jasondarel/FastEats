// src/components/UI/ErrorState.jsx
import React from "react";

const ErrorState = ({ message = "An error occurred" }) => {
  return (
    <div className="flex justify-center items-center w-full h-32">
      <div className="bg-red-100 p-6 rounded-lg shadow-md">
        <p className="text-xl text-red-600">{message}</p>
      </div>
    </div>
  );
};

export default ErrorState;
