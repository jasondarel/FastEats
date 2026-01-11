/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import Sidebar from "../../../components/Sidebar";

const ErrorBoundary = ({ error, onRetry, onGoBack, hasMessages }) => {
  if (!error || hasMessages) return null;

  return (
    <div className="flex flex-col md:flex-row w-full md:pl-64 h-screen bg-yellow-50">
      <Sidebar />
      <div className="flex flex-col flex-grow h-full items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-600 text-lg font-medium mb-4">
            Error loading chat
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors mr-4"
          >
            Retry
          </button>
          <button
            onClick={onGoBack}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go Back to Chats
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
