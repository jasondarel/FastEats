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
import { API_URL, CHAT_URL } from "../../config/api";
import io from "socket.io-client";

const ChatRoom = (chat) => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [fetchedOrderDetails, setFetchedOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const orderDetails = location.state || {};
  console.log("Order Details:", orderDetails);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (value.trim() !== '') {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('typing', {
          chatId,
          userId: currentUserId,
          username: currentUserRole === 'seller' ? orderDetails?.customerName || 'Customer' : orderDetails?.restaurantName || 'Restaurant',
          isTyping: true
        });
      }
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('typing', {
          chatId,
          userId: currentUserId,
          username: currentUserRole === 'seller' ? orderDetails?.customerName || 'Customer' : orderDetails?.restaurantName || 'Restaurant',
          isTyping: false
        });
      }
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const setupSocket = () => {
  if (socketRef.current) return;
  
  try {
    console.log("Attempting to connect to Socket.IO server at:", CHAT_URL);
    
    socketRef.current = io(CHAT_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id);
      setIsSocketConnected(true);
      
      console.log(`Joining chat room: chat_${chatId}`);
      socketRef.current.emit('join_room', `chat_${chatId}`);
      
      if (currentUserId) {
        console.log(`Joining user room: user_${currentUserId}`);
        socketRef.current.emit('join_room', `user_${currentUserId}`);
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsSocketConnected(false);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsSocketConnected(false);
      
      if (reason === 'io server disconnect') {
        console.log('Server disconnected the socket. Attempting to reconnect...');
        socketRef.current.connect();
      }
    });

    socketRef.current.onAny((event, ...args) => {
      console.log(`🔔 Received Socket.IO event: ${event}`, args);
    });

    socketRef.current.on('new_message', (messageData) => {
      
      const transformedMessage = {
        id: messageData._id || messageData.id || `socket-${Date.now()}`,
        sender: determineMessageSender(messageData.sender),
        message: messageData.text || messageData.message || "",
        timestamp: messageData.createdAt || messageData.timestamp || new Date().toISOString(),
      };
      
      setMessages(prevMessages => {
        const exists = prevMessages.some(msg => {
          const isDuplicate = msg.id === transformedMessage.id || 
            (msg.message === transformedMessage.message && 
            Math.abs(new Date(msg.timestamp) - new Date(transformedMessage.timestamp)) < 5000);
          
          if (isDuplicate) {
            console.log('Duplicate message detected, skipping:', msg);
          }
          return isDuplicate;
        });
        
        if (exists) {
          console.log('Message already exists, not adding to state');
          return prevMessages;
        }
        
        console.log('Adding new message to state');
        return [...prevMessages, transformedMessage];
      });
    });

    socketRef.current.on('user_typing', (data) => {
      console.log('User typing update:', data);
      
      if (data.userId === currentUserId) return;
      
      if (data.isTyping) {
        setTypingUsers(prev => {
          if (prev.some(user => user.userId === data.userId)) {
            return prev;
          }
          return [...prev, { userId: data.userId, username: data.username }];
        });
      } else {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }
    });


    socketRef.current.on('update_chat', (chatData) => {
      console.log('Received update_chat event:', chatData);
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  } catch (err) {
    console.error('Socket setup error:', err);
    setError(`Socket connection failed: ${err.message}`);
  }
};

  const determineMessageSender = (sender) => {
    if (!sender || !currentUserRole || !currentUserId) return "otherUser";
    
    if (typeof sender === 'object') {
      const senderRole = sender.type || sender.role;
      const senderId = sender.id || sender.userId;
      
      if (currentUserRole === "seller") {
        if (["seller", "restaurant"].includes(senderRole?.toLowerCase())) {
          return "currentUser";
        }
      } else if (currentUserRole === "user" || currentUserRole === "customer") {
        if (["user", "customer"].includes(senderRole?.toLowerCase())) {
          return "currentUser";
        }
      }
      
      if (senderId === currentUserId) {
        return "currentUser";
      }
    } else if (typeof sender === 'string') {
      if (currentUserRole === "seller") {
        if (["seller", "restaurant"].includes(sender.toLowerCase())) {
          return "currentUser";
        }
      } else if (currentUserRole === "user" || currentUserRole === "customer") {
        if (["user", "customer"].includes(sender.toLowerCase())) {
          return "currentUser";
        }
      }
    }
    
    return "otherUser";
  };

  const extractUserInfo = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserRole(payload.role);
      setCurrentUserId(payload.userId);

      return { token, payload };
    } catch (error) {
      console.error("Token extraction failed:", error);
      throw error;
    }
  };

  const createMessageService = async (messageData, token) => {
    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));

      const enhancedMessageData = {
        ...messageData,
        sender: {
          id: tokenPayload.userId,
          type: tokenPayload.role,
          role: tokenPayload.role,
        },
      };

      console.log("Sending message with enhanced data:", enhancedMessageData);

      const response = await fetch(`${API_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(enhancedMessageData),
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
      const response = await fetch(`${API_URL}/chat/message?chatId=${chatId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Data from API: ", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch messages");
      }

      return { success: true, messages: data.dataMessage || [] };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { success: false, error: error.message };
    }
  };

  const transformMessages = (apiMessages, currentRole, currentUserId) => {
    console.log("=== TRANSFORM MESSAGES DEBUG ===");
    console.log("Current Role:", currentRole);
    console.log("Current User ID:", currentUserId);
    console.log("Total messages to transform:", apiMessages.length);

    return apiMessages.map((msg, index) => {
      console.log(`\n--- Message ${index} ---`);
      console.log("Raw message:", msg);
      console.log("msg.sender:", msg.sender);
      console.log("msg.sender.type:", msg.sender?.type);
      console.log("msg.sender.role:", msg.sender?.role);
      console.log("msg.sender.id:", msg.sender?.id);

      let isCurrentUserMessage = false;

      if (msg.sender) {
        if (msg.sender.type || msg.sender.role) {
          const senderRole = msg.sender.type || msg.sender.role;

          if (currentRole === "seller") {
            isCurrentUserMessage = ["seller", "restaurant"].includes(
              senderRole.toLowerCase()
            );
          } else if (currentRole === "user" || currentRole === "customer") {
            isCurrentUserMessage = ["user", "customer"].includes(
              senderRole.toLowerCase()
            );
          }

          console.log(
            `✓ Type/Role check: sender=${senderRole}, current=${currentRole}, match=${isCurrentUserMessage}`
          );
        } else if (msg.sender.id || msg.sender.userId) {
          isCurrentUserMessage =
            (msg.sender.id || msg.sender.userId) === currentUserId;
          console.log(
            `✓ ID check: senderID=${
              msg.sender.id || msg.sender.userId
            }, currentID=${currentUserId}, match=${isCurrentUserMessage}`
          );
        } else if (typeof msg.sender === "string") {
          console.log(`✓ String check: sender="${msg.sender}"`);

          if (currentRole === "seller") {
            isCurrentUserMessage = ["seller", "restaurant"].includes(
              msg.sender.toLowerCase()
            );
          } else {
            isCurrentUserMessage = ["user", "customer"].includes(
              msg.sender.toLowerCase()
            );
          }
          console.log(`String match result: ${isCurrentUserMessage}`);
        }
      } else {
        console.log("❌ No sender info found");
      }

      if (!isCurrentUserMessage && !msg.sender) {
        const messageTime = new Date(msg.createdAt || msg.timestamp);
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        isCurrentUserMessage = messageTime > fiveMinutesAgo;
      }

      let uiSender;
      if (isCurrentUserMessage) {
        uiSender = "currentUser";
      } else {
        uiSender = "otherUser";
      }

      console.log(
        `Final result: isCurrentUser=${isCurrentUserMessage}, uiSender="${uiSender}"`
      );

      return {
        id: msg._id || msg.id || `msg-${Date.now()}-${Math.random()}`,
        sender: uiSender,
        message: msg.text || msg.message || "",
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
      };
    });
  };

  const fetchMessages = async () => {
    try {
      const { token, payload } = extractUserInfo();

      console.log("Fetching messages for:", {
        role: payload.role,
        userId: payload.userId,
        chatId,
      });

      const result = await getMessagesService(chatId, token);

      if (result.success) {
        console.log("Raw messages from API:", result.messages);

        const transformedMessages = transformMessages(
          result.messages,
          payload.role,
          payload.userId
        );

        console.log("Transformed messages:", transformedMessages);
        setMessages(transformedMessages);
      } else {
        console.error("Failed to fetch messages:", result.error);
        setError(`Failed to load messages: ${result.error}`);
      }
    } catch (err) {
      console.error("Error in fetchMessages:", err);
      setError(`Error loading chat: ${err.message}`);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      console.log("Token Payload:", tokenPayload);

      try {
        console.log("Fetching chat details for chatId:", chatId);
        console.log("Using token:", token);
        const chat = await getChatByIdService(chatId, token);
        console.log("Fetched chat details:", chat);
        setFetchedOrderDetails(chat.dataChat);
      } catch (chatError) {
        console.warn(
          "Failed to fetch chat details, continuing with limited info:",
          chatError
        );
        setFetchedOrderDetails({
          _id: chatId,
          orderDetails: { status: "Active" },
          participants: [],
        });
      }

      await fetchMessages();
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
      try {
        extractUserInfo();
        fetchOrderDetails();
      } catch (error) {
        console.error("Initialization error:", error);
        setError("Authentication failed. Please login again.");
      }
    }
  }, [chatId]);

  useEffect(() => {
    if (currentUserId && chatId) {
      setupSocket();
    }
    
    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket on component unmount');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUserId, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatId || isSocketConnected) return;
    
    console.log('Setting up fallback polling since Socket.IO is not connected');
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [chatId, isSocketConnected]);

  useEffect(() => {
    if (currentUserId && chatId) {
      setupSocket();
    }
    
    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket on component unmount');
        
        if (isTyping) {
          socketRef.current.emit('typing', {
            chatId,
            userId: currentUserId,
            username: currentUserRole === 'seller' ? 'Restaurant' : 'Customer',
            isTyping: false
          });
        }
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUserId, chatId, isTyping, currentUserRole]);

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
      const { token, payload } = extractUserInfo();

      const tempMessage = {
        id: `temp-${Date.now()}`,
        sender: "currentUser",
        message: messageText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMessage]);

      const messageData = {
        chatId,
        text: messageText,
        messageType: "text",
        senderRole: payload.role,
        senderId: payload.userId,
      };

      console.log("Sending message data:", messageData);

      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('send_message', {
          ...messageData,
          sender: {
            type: payload.role,
            id: payload.userId
          },
          timestamp: new Date().toISOString()
        });
      }

      const result = await createMessageService(messageData, token);

      if (result.success) {
        console.log("Message sent successfully:", result.message);

        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== tempMessage.id);
          const serverMessage = {
            id:
              result.message._id || result.message.id || `server-${Date.now()}`,
            sender: "currentUser",
            message: result.message.text || messageText,
            timestamp: result.message.createdAt || new Date().toISOString(),
          };
          return [...filtered, serverMessage];
        });

        setError(null);
      } else {
        console.error("Failed to send message:", result.error);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        setError(`Failed to send message: ${result.error}`);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== `temp-${Date.now()}`)
      );
      setError(`Error sending message: ${err.message}`);
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
                if (!socketRef.current) {
                  setupSocket();
                }
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
        {/* {isSocketConnected ? (
          <div className="bg-green-50 text-green-700 text-xs px-4 py-1 text-center">
            ⚡ Live chat connected
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 text-xs px-4 py-1 text-center">
            ⏱️ Using message polling
          </div>
        )} */}

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

        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-6xl mx-auto p-4">
            <div className="h-full bg-white rounded-lg shadow-sm flex flex-col">
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
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {date}
                            </div>
                          </div>

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
                                    message.sender === "currentUser"
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                      message.sender === "currentUser"
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
                                          message.sender === "currentUser"
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
              {typingUsers.length > 0 && (
                <div className="px-4 py-2 text-xs text-gray-500 italic">
                  {typingUsers.length === 1 
                    ? `${typingUsers[0].username} is typing...` 
                    : `${typingUsers.length} people are typing...`}
                  <div className="flex space-x-1 mt-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" 
                      style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" 
                      style={{ animationDelay: "300ms" }}></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" 
                      style={{ animationDelay: "600ms" }}></div>
                  </div>
                </div>
              )}
              <div className="border-t bg-gray-50 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onBlur={handleTypingStop}
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