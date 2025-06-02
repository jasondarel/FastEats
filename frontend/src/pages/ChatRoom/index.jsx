/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaStore,
  FaReceipt,
  FaPhoneAlt,
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import StatusBadge from "../../components/StatusBadge";
import { getChatByIdService } from "../../service/chatServices/chatService";
import { API_URL } from "../../config/api";

const ChatRoom = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fetchedOrderDetails, setFetchedOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  const orderDetails = location.state || {};
  console.log("Order Details:", orderDetails);

  const createMessageService = async (messageData, token) => {
    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      return { success: true, message: data.dataMessage };
    } catch (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }
  };

  const getMessagesService = async (chatId, token) => {
    try {
      const response = await fetch(`/{API_URL}/chat/${chatId}/messages`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch messages");
      }

      return { success: true, messages: data.dataMessages || [] };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { success: false, error: error.message };
    }
  };

  // Fetch order details function
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const chat = await getChatByIdService(chatId, token);
      console.log("Fetched chat details:", chat);
      setFetchedOrderDetails(chat.dataChat);

      await fetchMessages();
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const result = await getMessagesService(chatId, token);
      if (result.success) {
        const transformedMessages = result.messages.map((msg) => ({
          id: msg._id || msg.id,
          sender: msg.sender?.type === "user" ? "user" : "restaurant",
          message: msg.text,
          timestamp: msg.createdAt || msg.timestamp,
        }));
        setMessages(transformedMessages);
      } else {
        console.error("Failed to fetch messages:", result.error);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid time";
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid time";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch (err) {
      return "Invalid date";
    }
  };

  useEffect(() => {
    if (chatId) {
      fetchOrderDetails();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSendingMessage(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const tempMessage = {
        id: Date.now(),
        sender: "user",
        message: messageText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMessage]);

      const result = await createMessageService(
        {
          chatId,
          text: messageText,
          messageType: "text",
        },
        token
      );

      if (result.success) {
        setMessages((prev) => {
          const newMessages = prev.filter((msg) => msg.id !== tempMessage.id);
          const serverMessage = {
            id: result.message._id || result.message.id,
            sender:
              result.message.sender?.type === "user" ? "user" : "restaurant",
            message: result.message.text,
            timestamp: result.message.createdAt || result.message.timestamp,
          };
          return [...newMessages, serverMessage];
        });
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        setError("Failed to send message: " + result.error);
      }
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg.id === Date.now()));
      setError("Failed to send message: " + err.message);
      console.error("Error sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleBackClick = () => {
    navigate("/chat");
  };

  const handleQuickMessage = (message) => {
    if (!sendingMessage) {
      setNewMessage(message);
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const currentOrderDetails = fetchedOrderDetails;

  if (error && !messages.length) {
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
              onClick={() => {
                setError(null);
                fetchOrderDetails();
              }}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors mr-4"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back to Chats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full md:pl-64 h-screen bg-yellow-50">
      <Sidebar />

      <div className="flex flex-col flex-grow h-full">
        {/* Chat Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackClick}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Go back to chat list"
                >
                  <FaArrowLeft className="text-gray-600" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center overflow-hidden">
                    {orderDetails.restaurantImage ||
                    orderDetails.customerImage ? (
                      <img
                        src={
                          orderDetails.restaurantImage ||
                          orderDetails.customerImage
                        }
                        alt={
                          orderDetails.restaurantName ||
                          orderDetails.customerName ||
                          "Profile"
                        }
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <FaStore
                      className={`text-yellow-600 ${
                        orderDetails.restaurantImage ||
                        orderDetails.customerImage
                          ? "hidden"
                          : "flex"
                      }`}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {orderDetails.restaurantName ||
                        orderDetails.customerName ||
                        "Restaurant"}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Order #{orderDetails.orderId || chatId || "Unknown"}
                      </span>
                      <StatusBadge
                        status={
                          currentOrderDetails?.orderDetails?.status || "Unknown"
                        }
                        className="text-xs px-2 py-1 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right text-sm">
                  <div className="text-gray-600">
                    {orderDetails.itemCount || 0} item
                    {(orderDetails.itemCount || 0) !== 1 ? "s" : ""}
                  </div>
                  <div className="font-semibold text-gray-800">
                    {formatPrice(orderDetails.totalPrice)}
                  </div>
                </div>

                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => alert("Calling restaurant... (Demo feature)")}
                  aria-label="Call restaurant"
                >
                  <FaPhoneAlt className="text-yellow-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-6xl mx-auto p-4">
            <div className="h-full bg-white rounded-lg shadow-sm flex flex-col">
              {/* Error Banner */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="text-red-700 underline text-sm mt-1"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading && messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : Object.keys(groupedMessages).length === 0 ? (
                  <div className="text-center py-8">
                    <FaReceipt className="text-gray-300 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">
                      No messages yet
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Start a conversation with the restaurant
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedMessages).map(
                      ([date, dayMessages]) => (
                        <div key={date}>
                          {/* Date Separator */}
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {date}
                            </div>
                          </div>

                          {/* Messages for this date */}
                          <div className="space-y-4">
                            {dayMessages.map((message, index) => {
                              const isLastFromSender =
                                index === dayMessages.length - 1 ||
                                dayMessages[index + 1]?.sender !==
                                  message.sender;

                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${
                                    message.sender === "user"
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                      message.sender === "user"
                                        ? "bg-yellow-500 text-white rounded-br-md"
                                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                                    } ${!isLastFromSender ? "mb-1" : "mb-2"}`}
                                  >
                                    <p className="text-sm leading-relaxed">
                                      {message.message}
                                    </p>
                                    {isLastFromSender && (
                                      <p
                                        className={`text-xs mt-2 ${
                                          message.sender === "user"
                                            ? "text-yellow-100"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {formatTime(message.timestamp)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t bg-gray-50 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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

                {/* Quick Actions */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() =>
                      handleQuickMessage("How long will my order take?")
                    }
                    className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                    disabled={sendingMessage}
                  >
                    Order time?
                  </button>
                  <button
                    onClick={() =>
                      handleQuickMessage("Can I make changes to my order?")
                    }
                    className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                    disabled={sendingMessage}
                  >
                    Make changes?
                  </button>
                  <button
                    onClick={() => handleQuickMessage("Thank you!")}
                    className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                    disabled={sendingMessage}
                  >
                    Thank you!
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
