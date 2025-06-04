/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { FaReceipt } from "react-icons/fa";
import MessageBubble from "./MessageBubble";

const MessagesContainer = ({
  loading,
  groupedMessages,
  formatTime,
  formatDate,
}) => {
  if (loading && Object.keys(groupedMessages).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (Object.keys(groupedMessages).length === 0) {
    return (
      <div className="text-center py-8">
        <FaReceipt className="text-gray-300 text-4xl mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No messages yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Start a conversation with the restaurant
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date}>
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {date}
            </div>
          </div>

          <div className="space-y-4">
            {dayMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                formatTime={formatTime}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessagesContainer;
