/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

const MessageBubble = ({ message, formatTime }) => {
  return (
    <div
      className={`flex ${
        message.sender === "currentUser" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          message.sender === "currentUser"
            ? "bg-yellow-500 text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        } mb-2`}
      >
        <p className="text-sm leading-relaxed">{message.message}</p>
        <p
          className={`text-xs mt-2 ${
            message.sender === "currentUser"
              ? "text-yellow-100"
              : "text-gray-500"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
