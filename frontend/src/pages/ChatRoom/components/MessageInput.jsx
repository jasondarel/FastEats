/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { FaPaperPlane } from "react-icons/fa";

const MessageInput = ({
  newMessage,
  onMessageChange,
  onSubmit,
  onTypingStop,
  sendingMessage,
  quickMessages,
  onQuickMessage,
}) => {
  return (
    <div className="border-t bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="flex space-x-3">
        <input
          type="text"
          value={newMessage}
          onChange={onMessageChange}
          onBlur={onTypingStop}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white"
          disabled={sendingMessage}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sendingMessage}
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

      {quickMessages && quickMessages.length > 0 && (
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
