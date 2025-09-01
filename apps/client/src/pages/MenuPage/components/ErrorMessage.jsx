/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// components/ErrorMessage.jsx
import React from "react";

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {message}
    </div>
  );
};

export default ErrorMessage;
