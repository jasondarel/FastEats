import React, { useState, useEffect } from "react";
import { FaPaperPlane, FaImage, FaTimes, FaReceipt } from "react-icons/fa";
import { HiOutlineGif } from "react-icons/hi2";
import GifPicker from "./GifPicker";
import { API_URL } from "../../../config/api";

const MessageInput = ({
  newMessage,
  onMessageChange,
  onSubmit,
  onTypingStop,
  sendingMessage,
  quickMessages,
  onQuickMessage,

  selectedImage,
  onImageSelect,
  onImageRemove,
  imagePreview,

  selectedGif,
  onGifSelect,
  onGifRemove,

  onAttachOrderDetails,
  canAttachOrderDetails = true,
}) => {
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setIsGifPickerOpen(false);
      onImageSelect(file);
    }
  };

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

  const triggerImageSelect = () => {
    document.getElementById("image-input").click();
  };

  const handleGifSelect = (gifData) => {
    if (selectedImage) {
      onImageRemove();
    }
    onGifSelect(gifData);
    setIsGifPickerOpen(false);
  };

  const handleGifPickerToggle = () => {
    setIsGifPickerOpen(!isGifPickerOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let messageType = "text";
    if (selectedGif) {
      messageType = "gif";
    } else if (selectedImage) {
      messageType = "image";
    }

    const enhancedEvent = {
      ...e,
      messageType,
      gifData: selectedGif,
    };

    onSubmit(enhancedEvent);
  };

  return (
    <div className="border-t bg-gray-50 p-4 relative">
      <GifPicker
        isOpen={isGifPickerOpen}
        onClose={() => setIsGifPickerOpen(false)}
        onGifSelect={handleGifSelect}
        onToggle={handleGifPickerToggle}
      />

      {selectedGif && (
        <div className="mb-4 relative inline-block">
          <div className="relative bg-white rounded-lg border p-2 shadow-sm">
            <img
              src={selectedGif.url}
              alt={selectedGif.title}
              className="max-w-xs max-h-32 rounded object-cover"
            />
            <button
              onClick={onGifRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              disabled={sendingMessage}
            >
              <FaTimes size={12} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedGif.title || "GIF"}
          </p>
        </div>
      )}

      {selectedImage && imagePreview && (
        <div className="mb-4 relative inline-block">
          <div className="relative bg-white rounded-lg border p-2 shadow-sm">
            <img
              src={imagePreview}
              alt="Selected"
              className="max-w-xs max-h-32 rounded object-cover"
            />
            <button
              onClick={onImageRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              disabled={sendingMessage}
            >
              <FaTimes size={12} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{selectedImage.name}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={onMessageChange}
            onBlur={onTypingStop}
            placeholder={
              selectedGif
                ? "Add a caption to your GIF..."
                : selectedImage
                ? "Add a caption..."
                : "Type your message..."
            }
            className="w-full border border-gray-300 rounded-full px-4 py-3 pr-28 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white"
            disabled={sendingMessage}
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
            {canAttachOrderDetails && role === "user" && (
              <button
                type="button"
                onClick={onAttachOrderDetails}
                className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                disabled={sendingMessage}
                title="Attach Order Details"
              >
                <FaReceipt size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={handleGifPickerToggle}
              className={`p-1 transition-colors ${
                isGifPickerOpen
                  ? "text-yellow-500"
                  : "text-gray-400 hover:text-yellow-500"
              }`}
              disabled={sendingMessage}
              title="Add GIF"
            >
              <HiOutlineGif size={18} />
            </button>

            <button
              type="button"
              onClick={triggerImageSelect}
              className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
              disabled={sendingMessage}
              title="Add Image"
            >
              <FaImage size={16} />
            </button>
          </div>

          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={sendingMessage}
          />
        </div>

        <button
          type="submit"
          disabled={
            (!newMessage.trim() && !selectedImage && !selectedGif) ||
            sendingMessage
          }
          className="bg-yellow-500 text-white px-6 py-3 rounded-full hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 font-medium"
        >
          {sendingMessage ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FaPaperPlane className="text-sm" />
          )}
          <span className="hidden sm:inline">
            {sendingMessage ? "Sending..." : "Send"}
          </span>
        </button>
      </form>

      {quickMessages &&
        quickMessages.length > 0 &&
        !selectedImage &&
        !selectedGif && (
          <div className="flex flex-wrap gap-2 mt-3">
            {quickMessages.map((quickMsg, index) => (
              <button
                key={index}
                onClick={() => onQuickMessage(quickMsg.text)}
                className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                disabled={sendingMessage}
              >
                {quickMsg.label}
              </button>
            ))}
          </div>
        )}
    </div>
  );
};

export default MessageInput;
