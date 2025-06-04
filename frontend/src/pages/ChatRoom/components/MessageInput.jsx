import React from "react";
import { FaPaperPlane, FaImage, FaTimes } from "react-icons/fa";

const MessageInput = ({
  newMessage,
  onMessageChange,
  onSubmit,
  onTypingStop,
  sendingMessage,
  quickMessages,
  onQuickMessage,
  // New props for image handling
  selectedImage,
  onImageSelect,
  onImageRemove,
  imagePreview,
}) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      onImageSelect(file);
    }
  };

  const triggerImageSelect = () => {
    document.getElementById("image-input").click();
  };

  return (
    <div className="border-t bg-gray-50 p-4">
      {/* Image Preview */}
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

      <form onSubmit={onSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={onMessageChange}
            onBlur={onTypingStop}
            placeholder={
              selectedImage ? "Add a caption..." : "Type your message..."
            }
            className="w-full border border-gray-300 rounded-full px-4 py-3 pr-12 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white"
            disabled={sendingMessage}
          />

          {/* Image attachment button */}
          <button
            type="button"
            onClick={triggerImageSelect}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-yellow-500 transition-colors"
            disabled={sendingMessage}
          >
            <FaImage size={16} />
          </button>

          {/* Hidden file input */}
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
          disabled={(!newMessage.trim() && !selectedImage) || sendingMessage}
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

      {quickMessages && quickMessages.length > 0 && !selectedImage && (
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
