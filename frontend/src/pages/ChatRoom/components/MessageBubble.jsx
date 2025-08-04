/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import OrderDetailsCard from "./OrderDetailsCard";
import { API_URL } from "../../../config/api";

const MessageBubble = ({ message, formatTime, formatPrice }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const messageType = message.messageType || message.type;
  const [role, setRole] = useState("");

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/user/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user profile. Status: ${response.status}`
        );
      }

      const data = await response.json();
      setRole(data.user.role);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleImageError = () => {
    const mediaUrl = messageType === "gif" ? message.gifUrl : message.imageUrl;
    console.log("Image/GIF failed to load:", mediaUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    const mediaUrl = messageType === "gif" ? message.gifUrl : message.imageUrl;
    console.log("Image/GIF loaded successfully:", mediaUrl);
    setImageLoading(false);
  };

  const openMediaInNewTab = (mediaUrl) => {
    window.open(mediaUrl, "_blank");
  };

  const hasTextContent =
    message.message &&
    message.message.trim() !== "" &&
    !(messageType === "gif" && message.message === message.gifTitle);

  const isMediaMessage = messageType === "image" || messageType === "gif";

  let mediaUrl = null;
  if (messageType === "gif") {
    mediaUrl = message.gifUrl || (message.gifData && message.gifData.url);
  } else if (messageType === "image") {
    mediaUrl = message.imageUrl;
  }

  if (messageType === "order_details" && message.orderDetails) {
    return (
      <div
        className={`flex ${
          message.sender === "currentUser" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-md rounded-2xl ${
            message.sender === "currentUser"
              ? "bg-yellow-500 text-white rounded-br-md"
              : "bg-gray-100 text-gray-800 rounded-bl-md"
          } mb-2 overflow-hidden`}
        >
          <div className="p-4">
            <OrderDetailsCard
              orderDetails={message.orderDetails}
              formatPrice={formatPrice}
              formatTime={formatTime}
              isInMessage={true}
              currentUserRole={role}
            />

            {message.message && message.message.trim() && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm leading-relaxed">{message.message}</p>
              </div>
            )}
          </div>

          <div className="px-4 pb-3">
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
                alt={messageType === "gif" ? "GIF" : "Shared image"}
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
                    Failed to load {messageType === "gif" ? "GIF" : "image"}
                  </span>
                  {messageType === "gif" && (
                    <div className="text-xs mt-1">URL: {mediaUrl}</div>
                  )}
                </div>
              </div>
            )}

            {messageType === "gif" && !imageError && !imageLoading && (
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                GIF
              </div>
            )}
          </div>
        )}

        {messageType === "gif" && !mediaUrl && (
          <div className="p-4 bg-red-100 text-red-800 text-xs">
            <div>GIF Message Debug:</div>
            <div>gifUrl: {message.gifUrl || "null"}</div>
            <div>
              gifData:{" "}
              {message.gifData ? JSON.stringify(message.gifData) : "null"}
            </div>
          </div>
        )}

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
