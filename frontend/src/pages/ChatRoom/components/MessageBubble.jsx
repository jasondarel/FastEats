/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";

const MessageBubble = ({ message, formatTime }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, "_blank");
  };

  return (
    <div
      className={`flex ${
        message.sender === "currentUser" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs lg:max-w-md rounded-2xl ${
          message.sender === "currentUser"
            ? "bg-yellow-500 text-white rounded-br-md"
            : "bg-gray-100 text-gray-800 rounded-bl-md"
        } mb-2 overflow-hidden`}
      >
        {/* Image content */}
        {message.type === "image" && message.imageUrl && (
          <div className="relative">
            {imageLoading && (
              <div className="flex items-center justify-center h-32 bg-gray-200">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
              </div>
            )}
            {!imageError ? (
              <img
                src={message.imageUrl}
                alt="Shared image"
                className={`w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                  imageLoading ? "hidden" : "block"
                }`}
                onClick={() => openImageInNewTab(message.imageUrl)}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="flex items-center justify-center h-32 bg-gray-200 text-gray-500">
                <span className="text-sm">Failed to load image</span>
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        {(message.message || message.type !== "image") && (
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed">
              {message.message || (message.type === "image" ? "" : "Message")}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`px-4 pb-3 ${
            message.type === "image" && !message.message ? "pt-3" : ""
          }`}
        >
          <p
            className={`text-xs ${
              message.sender === "currentUser"
                ? "text-yellow-100"
                : "text-gray-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
