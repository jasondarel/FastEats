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

// Dummy chat messages for demo
// const DUMMY_MESSAGES = {
//   12345: [
//     {
//       id: 1,
//       sender: "restaurant",
//       message: "Hello! We've received your order and are starting preparation.",
//       timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
//     },
//     {
//       id: 2,
//       sender: "user",
//       message: "Great! How long will it take approximately?",
//       timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
//     },
//     {
//       id: 3,
//       sender: "restaurant",
//       message: "Your order is being prepared and will be ready in 15 minutes!",
//       timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
//     },
//   ],
//   12346: [
//     {
//       id: 1,
//       sender: "restaurant",
//       message:
//         "Thank you for your order! We're reviewing your special request.",
//       timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
//     },
//     {
//       id: 2,
//       sender: "restaurant",
//       message:
//         "We're working on your special request. Thanks for your patience!",
//       timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
//     },
//   ],
//   12348: [
//     {
//       id: 1,
//       sender: "restaurant",
//       message: "Thank you for your order! We'll start preparing it shortly.",
//       timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
//     },
//   ],
//   12349: [
//     {
//       id: 1,
//       sender: "restaurant",
//       message: "Hello! Your order has been received.",
//       timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
//     },
//     {
//       id: 2,
//       sender: "user",
//       message: "Hi! Can you make sure the pizza is extra crispy?",
//       timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
//     },
//     {
//       id: 3,
//       sender: "restaurant",
//       message: "Chef is preparing your order with extra care! ETA: 10 minutes.",
//       timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
//     },
//   ],
// };

const ChatRoom = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [fetchedOrderDetails, setFetchedOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  // Get order details from navigation state
  const orderDetails = location.state || {};
  console.log("Order Details:", orderDetails);

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
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
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

  // Format time function
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

  // Format date function for message grouping
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

  // Load messages and fetch order details on component mount
  useEffect(() => {
    // const loadMessages = () => {
    //   if (chatId && DUMMY_MESSAGES[chatId]) {
    //     setMessages(DUMMY_MESSAGES[chatId]);
    //   } else {
    //     setMessages([]);
    //   }
    // };

    // loadMessages();
    
    // Fetch order details if chatId exists
    if (chatId) {
      fetchOrderDetails();
    }
  }, [chatId]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading || isTyping) return;

    const message = {
      id: Date.now(),
      sender: "user",
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate restaurant response delay
    setTimeout(() => {
      setIsTyping(false);
      setLoading(true);

      const responses = [
        "Thank you for your message! We'll get back to you shortly.",
        "We're preparing your order with care!",
        "Your order will be ready soon!",
        "Thanks for choosing us!",
        "We appreciate your patience!",
        "Our chef is working on your order right now!",
        "We'll notify you when your order is ready for pickup.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const restaurantMessage = {
        id: Date.now() + 1,
        sender: "restaurant",
        message: randomResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, restaurantMessage]);
      setLoading(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const handleBackClick = () => {
    navigate("/chat");
  };

  const handleQuickMessage = (message) => {
    if (!loading && !isTyping) {
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

  // Get the current order details (prioritize fetched over passed state)
  const currentOrderDetails = fetchedOrderDetails;

  if (error) {
    return (
      <div className="flex flex-col md:flex-row w-full md:pl-64 h-screen bg-yellow-50">
        <Sidebar />
        <div className="flex flex-col flex-grow h-full items-center justify-center">
          <div className="text-center p-8">
            <p className="text-red-600 text-lg font-medium mb-4">Error loading chat</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/chat")}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
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
                    {orderDetails.restaurantImage || orderDetails.customerImage ? (
                      <img
                        src={orderDetails.restaurantImage || orderDetails.customerImage}
                        alt={orderDetails.restaurantName || orderDetails.customerName || "Profile"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <FaStore
                      className={`text-yellow-600 ${
                        orderDetails.restaurantImage || orderDetails.customerImage ? "hidden" : "flex"
                      }`}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {orderDetails.restaurantName || orderDetails.customerName || "Restaurant"}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Order #{orderDetails.orderId || chatId || "Unknown"}
                      </span>
                      <StatusBadge
                        status={currentOrderDetails?.orderDetails?.status || "Unknown"}
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
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {Object.keys(groupedMessages).length === 0 ? (
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

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start mt-4">
                    <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1 items-center">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
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
                    disabled={loading || isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || loading || isTyping}
                    className="bg-yellow-500 text-white px-6 py-3 rounded-full hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 font-medium"
                  >
                    <FaPaperPlane className="text-sm" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>

                {/* Quick Actions */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleQuickMessage("How long will my order take?")}
                    className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                    disabled={loading || isTyping}
                  >
                    Order time?
                  </button>
                  <button
                    onClick={() => handleQuickMessage("Can I make changes to my order?")}
                    className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                    disabled={loading || isTyping}
                  >
                    Make changes?
                  </button>
                  <button
                    onClick={() => handleQuickMessage("Thank you!")}
                    className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                    disabled={loading || isTyping}
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