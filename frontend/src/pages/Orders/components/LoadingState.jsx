// src/components/UI/LoadingState.jsx
import React from "react";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center w-full h-32">
      <div className="bg-yellow-100 p-6 rounded-lg shadow-md">
        <p className="text-xl text-yellow-800">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
