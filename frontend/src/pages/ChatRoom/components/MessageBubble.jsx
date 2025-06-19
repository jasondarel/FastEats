import React, { useEffect, useState } from "react";

const MessageBubble = ({ message, formatTime }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (message.type === "gif") {
      console.log("MessageBubble received GIF message:", {
        id: message.id,
        type: message.type,
        gifUrl: message.gifUrl,
        gifTitle: message.gifTitle,
        gifData: message.gifData,
        message: message.message,
        fullMessage: message,
      });
    }
  }, [message]);

  const handleImageError = () => {
    const mediaUrl = message.type === "gif" ? message.gifUrl : message.imageUrl;
    console.log("Image/GIF failed to load:", mediaUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    const mediaUrl = message.type === "gif" ? message.gifUrl : message.imageUrl;
    console.log("Image/GIF loaded successfully:", mediaUrl);
    setImageLoading(false);
  };

  const openMediaInNewTab = (mediaUrl) => {
    window.open(mediaUrl, "_blank");
  };

  const hasTextContent =
    message.message &&
    message.message.trim() !== "" &&
    !(message.type === "gif" && message.message === message.gifTitle);

  const isMediaMessage = message.type === "image" || message.type === "gif";

  let mediaUrl = null;
  if (message.type === "gif") {
    mediaUrl = message.gifUrl || (message.gifData && message.gifData.url);
  } else if (message.type === "image") {
    mediaUrl = message.imageUrl;
  }

  if (isMediaMessage) {
    console.log("Rendering media message:", {
      type: message.type,
      mediaUrl,
      hasTextContent,
      isMediaMessage,
      gifUrl: message.gifUrl,
      gifData: message.gifData,
      imageUrl: message.imageUrl,
    });
  }

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
        {isMediaMessage && mediaUrl && (
          <div className="relative">
            {imageLoading && (
              <div className="flex items-center justify-center h-32 bg-gray-200">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
              </div>
            )}
            {!imageError ? (
              <img
                src={mediaUrl}
                alt={message.type === "gif" ? "GIF" : "Shared image"}
                className={`w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                  imageLoading ? "hidden" : "block"
                }`}
                onClick={() => openMediaInNewTab(mediaUrl)}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="flex items-center justify-center h-32 bg-gray-200 text-gray-500">
                <div className="text-center">
                  <span className="text-sm">
                    Failed to load {message.type === "gif" ? "GIF" : "image"}
                  </span>
                  {message.type === "gif" && (
                    <div className="text-xs mt-1">URL: {mediaUrl}</div>
                  )}
                </div>
              </div>
            )}

            {message.type === "gif" && !imageError && !imageLoading && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                GIF
              </div>
            )}
          </div>
        )}

        {/* Show debug info for GIF messages without media URL */}
        {message.type === "gif" && !mediaUrl && (
          <div className="p-4 bg-red-100 text-red-800 text-xs">
            <div>GIF Message Debug:</div>
            <div>gifUrl: {message.gifUrl || "null"}</div>
            <div>
              gifData:{" "}
              {message.gifData ? JSON.stringify(message.gifData) : "null"}
            </div>
          </div>
        )}

        {/* Only show text content if it's not just the GIF title */}
        {hasTextContent && (
          <div className="px-4 py-3">
            <p className="text-sm leading-relaxed">{message.message}</p>
          </div>
        )}

        <div
          className={`px-4 pb-3 ${
            isMediaMessage && !hasTextContent ? "pt-3" : ""
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
