/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="px-4 py-2 text-xs text-gray-500 italic">
      {typingUsers.length === 1
        ? `${typingUsers[0].username} is typing...`
        : `${typingUsers.length} people are typing...`}
      <div className="flex space-x-1 mt-1">
        <div
          className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
        <div
          className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "600ms" }}
        ></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
