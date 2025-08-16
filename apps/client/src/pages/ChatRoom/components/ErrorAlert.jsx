/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

const ErrorAlert = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex">
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={onDismiss}
            className="text-red-700 underline text-sm mt-1"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
