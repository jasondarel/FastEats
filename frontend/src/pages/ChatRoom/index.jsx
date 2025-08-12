/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessagesContainer from "./components/MessageContainer";
import MessageInput from "./components/MessageInput";
import TypingIndicator from "./components/TypingIndicator";
import ErrorAlert from "./components/ErrorAlert";
import ErrorBoundary from "./components/ErrorBoundary";
import { useChatSocket } from "./services/useChatSocket";
import { getChatByIdService } from "../../service/chatServices/chatService";
import OrderDetailsCard from "./components/OrderDetailsCard";
import { API_URL } from "../../config/api";
import { useSelector } from "react-redux";

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
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [selectedGif, setSelectedGif] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const orderDetails = location.state || {};
  console.log("ChatRoom - Order Details:", orderDetails);

  const {
    isSocketConnected,
    typingUsers,
    handleTypingStart,
    handleTypingStop,
    emitMessage,
    onNewMessage,
    offNewMessage,
  } = useChatSocket(chatId, currentUserId, currentUserRole, orderDetails);

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

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  console.log(
    "Attaching orderDetails:",
    orderDetails || fetchedOrderDetails?.orderDetails
  );

  const handleAttachOrderDetails = async () => {
    if (sendingMessage) return;

    const orderDetailsToAttach =
      orderDetails || fetchedOrderDetails?.orderDetails || null;

    console.log("Order details to attach:", orderDetailsToAttach);

    if (!orderDetailsToAttach) {
      setError("No order details available to attach");
      return;
    }

    const clientTempId = `client-temp-${Date.now()}-${Math.random()}`;

    setSendingMessage(true);

    try {
      const { token, payload } = extractUserInfo();

      const tempMessage = {
        id: clientTempId,
        clientTempId: clientTempId,
        sender: "currentUser",
        message: "", 
        timestamp: new Date().toISOString(),
        type: "order_details",
        orderDetails: orderDetailsToAttach,
      };
      setMessages((prev) => [...prev, tempMessage]);

      const messageData = {
        chatId,
        text: "",
        messageType: "order_details",
        senderRole: payload.role,
        senderId: payload.userId,
        clientTempId,
        orderDetails: orderDetailsToAttach,

        metadata: {
          type: "order_details",
          originalOrderDetails: orderDetailsToAttach,
        },
      };

      console.log("Attempting to send message with data:", messageData);

      if (isSocketConnected) {
        emitMessage({
          ...messageData,
          sender: {
            type: payload.role,
            id: payload.userId,
          },
          timestamp: new Date().toISOString(),
        });
      }

      const result = await createMessageService(messageData, token);

      if (result.success) {
        setMessages((prev) => {
          const filtered = prev.filter(
            (msg) => msg.clientTempId !== clientTempId
          );
          const serverMessage = {
            id:
              result.message._id || result.message.id || `server-${Date.now()}`,
            sender: "currentUser",
            message: result.message.text || "",
            timestamp: result.message.createdAt || new Date().toISOString(),
            type: "order_details",
            orderDetails: result.message.orderDetails || orderDetailsToAttach,
            clientTempId,
          };
          return [...filtered, serverMessage];
        });
        setError(null);
      } else {
        setMessages((prev) =>
          prev.filter((msg) => msg.clientTempId !== clientTempId)
        );
        setError(`Failed to attach order details: ${result.error}`);
      }
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => !msg.clientTempId));
      setError(`${err.message}`);
    } finally {
      setSendingMessage(false);
    }
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

  const handleImageSelect = (file) => {
    if (selectedGif) {
      setSelectedGif(null);
    }

    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleGifSelect = (gifData) => {
    if (selectedImage) {
      handleImageRemove();
    }

    setSelectedGif(gifData);
  };

  const handleGifRemove = () => {
    setSelectedGif(null);
  };

  const uploadImage = async (file, token) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("chatId", chatId);
    console.log("Uploading image:", file.name);
    try {
      const response = await fetch(`${API_URL}/chat/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const responseJson = await response.json();
        console.error(
          "Server error response:",
          responseJson.message || responseJson
        );

        return {
          success: false,
          error: `${responseJson.message || "Unknown error"}`,
        };
      }

      const data = await response.json();
      return { success: true, imageUrl: data.imageUrl };
    } catch (error) {
      console.error("Error uploading image:", error);
      return { success: false, error: error.message };
    }
  };

  const determineMessageSender = (sender) => {
    if (!sender || !currentUserRole || !currentUserId) return "otherUser";

    if (typeof sender === "object") {
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
    } else if (typeof sender === "string") {
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

  const transformMessages = (apiMessages, currentRole, currentUserId) => {
    apiMessages.forEach((msg, index) => {});

    return apiMessages.map((msg, index) => {
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
        } else if (msg.sender.id || msg.sender.userId) {
          isCurrentUserMessage =
            (msg.sender.id || msg.sender.userId) === currentUserId;
        } else if (typeof msg.sender === "string") {
          if (currentRole === "seller") {
            isCurrentUserMessage = ["seller", "restaurant"].includes(
              msg.sender.toLowerCase()
            );
          } else {
            isCurrentUserMessage = ["user", "customer"].includes(
              msg.sender.toLowerCase()
            );
          }
        }
      }

      let gifUrl = null;
      let gifTitle = null;

      if (msg.gifData?.url) {
        gifUrl = msg.gifData.url;
        gifTitle = msg.gifData.title;
      } else if (msg.gifUrl) {
        gifUrl = msg.gifUrl;
        gifTitle = msg.gifTitle;
      } else if (msg.attachments?.gifUrl) {
        gifUrl = msg.attachments.gifUrl;
        gifTitle = msg.attachments.gifTitle;
      } else if (
        msg.attachments?.url &&
        (msg.messageType === "gif" || msg.type === "gif")
      ) {
        gifUrl = msg.attachments.url;
        gifTitle = msg.attachments.title || msg.text || msg.message;
      } else if (
        (msg.messageType === "gif" || msg.type === "gif") &&
        msg.imageUrl
      ) {
        gifUrl = msg.imageUrl;
        gifTitle = msg.text || msg.message;
      }

      const gifData = gifUrl
        ? {
            url: gifUrl,
            title: gifTitle || "",
            id: msg.gifData?.id || msg._id || msg.id || `gif-${Date.now()}`,
          }
        : null;

      const messageType = msg.messageType || msg.type || "text";
      let finalImageUrl = null;

      if (messageType === "gif") {
        finalImageUrl = null;
      } else {
        finalImageUrl = msg.attachments?.url || msg.imageUrl || null;
      }

      if (messageType === "order_details") {
        return {
          id: msg._id || msg.id || `msg-${Date.now()}-${Math.random()}`,
          sender: isCurrentUserMessage ? "currentUser" : "otherUser",
          message: msg.text || msg.message || "",
          timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
          type: "order_details",
          orderDetails: msg.orderDetails,
          originalOrderDetails: msg.metadata?.originalOrderDetails,
        };
      }

      const transformedMessage = {
        id: msg._id || msg.id || `msg-${Date.now()}-${Math.random()}`,
        sender: isCurrentUserMessage ? "currentUser" : "otherUser",
        message: msg.text || msg.message || "",
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
        type: messageType,
        imageUrl: finalImageUrl,
        gifUrl,
        gifTitle,
        gifData,
      };

      return transformedMessage;
    });
  };

  const createMessageService = async (messageData, token) => {
    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      console.log("Message data before sending:", messageData);

      const enhancedMessageData = {
        ...messageData,
        sender: {
          id: tokenPayload.userId,
          type: tokenPayload.role,
          role: tokenPayload.role,
        },
      };

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
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch messages");
      }

      return { success: true, messages: data.dataMessage || [] };
    } catch (error) {
      console.error("Error fetching messages:", error);
      return { success: false, error: error.message };
    }
  };

  const fetchMessages = async () => {
    try {
      const { token, payload } = extractUserInfo();
      const result = await getMessagesService(chatId, token);

      if (result.success) {
        const transformedMessages = transformMessages(
          result.messages,
          payload.role,
          payload.userId
        );
        console.log("Transformed messages:", transformedMessages);
        setMessages(transformedMessages);
      } else {
        setError(`Failed to load messages: ${result.error}`);
      }
    } catch (err) {
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

      try {
        const chat = await getChatByIdService(chatId, token);
        setFetchedOrderDetails(chat.dataChat);
      } catch (chatError) {
        console.warn("Failed to fetch chat details:", chatError);
        setFetchedOrderDetails({
          _id: chatId,
          orderDetails: { status: "Active" },
          participants: [],
        });
      }

      await fetchMessages();
    } catch (err) {
      setError(err.message || "Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.trim() !== "") {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  const handleSendMessage = async (eventOrData) => {
    if (eventOrData && typeof eventOrData.preventDefault === "function") {
      eventOrData.preventDefault();
    }

    if (
      (!newMessage.trim() && !selectedImage && !selectedGif) ||
      sendingMessage
    )
      return;

    const messageText = newMessage.trim();
    const imageFile = selectedImage;
    const gifData = selectedGif;

    let messageType = "text";
    if (gifData) {
      messageType = "gif";
    } else if (imageFile) {
      messageType = "image";
    }

    const clientTempId = `client-temp-${Date.now()}-${Math.random()}`;

    setNewMessage("");
    handleImageRemove();
    handleGifRemove();
    setSendingMessage(true);

    try {
      const { token, payload } = extractUserInfo();

      let imageUrl = null;

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, token);
        if (uploadResult.success) {
          imageUrl = uploadResult.imageUrl;
        } else {
          throw new Error(`Image upload failed: ${uploadResult.error}`);
        }
      }

      const tempMessage = {
        id: clientTempId,
        clientTempId: clientTempId,
        sender: "currentUser",
        message: messageText,
        timestamp: new Date().toISOString(),
        type: messageType,
        imageUrl: imageUrl,
        gifUrl: gifData?.url || null,
        gifTitle: gifData?.title || null,
      };
      setMessages((prev) => [...prev, tempMessage]);

      const messageData = {
        chatId,
        text: messageText || (gifData ? gifData.title || "" : ""),
        messageType: messageType,
        senderRole: payload.role,
        senderId: payload.userId,
        clientTempId,
      };

      if (imageUrl) {
        messageData.imageUrl = imageUrl;
      }

      if (gifData) {
        messageData.gifData = {
          id: gifData.id,
          url: gifData.url,
          title: gifData.title,
          width: gifData.width,
          height: gifData.height,
        };
        messageData.gifUrl = gifData.url;
        messageData.gifTitle = gifData.title;
      }

      if (isSocketConnected) {
        const socketMessage = {
          ...messageData,
          sender: {
            type: payload.role,
            id: payload.userId,
          },
          timestamp: new Date().toISOString(),
        };

        if (imageUrl) {
          socketMessage.imageUrl = imageUrl;
          socketMessage.attachments = { url: imageUrl };
        }

        if (gifData) {
          socketMessage.gifData = gifData;
          socketMessage.gifUrl = gifData.url;
          socketMessage.gifTitle = gifData.title;
        }

        emitMessage(socketMessage);
      }

      const result = await createMessageService(messageData, token);
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => !msg.clientTempId));
      setError(`${err.message}`);
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

  const getQuickMessages = () => {
    if (currentUserRole === "seller" || currentUserRole === "restaurant") {
      return [
        {
          text: "Order received, preparing now",
          label: "Order received, preparing now",
        },
        {
          text: "Your order will be ready in 15 minutes",
          label: "Your order will be ready in 15 minutes",
        },
        { text: "Order has been delivered", label: "Order has been delivered" },
        { text: "Sorry for the delay", label: "Sorry for the delay" },
        {
          text: "Thank you for your order!",
          label: "Thank you for your order!",
        },
      ];
    } else {
      return [
        {
          text: "How long will my order take?",
          label: "How long will my order take?",
        },
        {
          text: "Can I make changes to my order?",
          label: "Can I make changes to my order?",
        },
        { text: "Is my order ready?", label: "Is my order ready?" },
        { text: "Where is my order?", label: "Where is my order?" },
        { text: "Thank you!", label: "Thank you!" },
      ];
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
useEffect(() => {
  const handleNewMessage = (messageData) => {
    console.log("Received new message from socket:", messageData);

    const senderInfo = messageData.sender;
    let isFromCurrentUser = false;
    
    if (senderInfo && currentUserId && currentUserRole) {
      if (typeof senderInfo === 'object') {
        const senderRole = senderInfo.type || senderInfo.role;
        const senderId = senderInfo.id || senderInfo.userId;
        
        if (senderId === currentUserId) {
          isFromCurrentUser = true;
        }
        else if (currentUserRole === "seller" && ["seller", "restaurant"].includes(senderRole?.toLowerCase())) {
          isFromCurrentUser = true;
        } else if ((currentUserRole === "user" || currentUserRole === "customer") && ["user", "customer"].includes(senderRole?.toLowerCase())) {
          isFromCurrentUser = true;
        }
      }
    }

    if (isFromCurrentUser) {
      console.log("Skipping own message from socket to prevent duplicate");
      return;
    }

    let messageType = messageData.messageType || messageData.type || "text";
    let imageUrl = null;
    let gifUrl = null;
    let gifTitle = null;

    if (messageType === "image" || messageData.imageUrl) {
      imageUrl = messageData.attachments?.url || messageData.imageUrl || null;
      messageType = "image";
    }

    if (messageType === "gif" || messageData.gifData || messageData.gifUrl) {
      gifUrl = messageData.gifData?.url || messageData.gifUrl || null;
      gifTitle = messageData.gifData?.title || messageData.gifTitle || null;
      messageType = "gif";
    }

    const transformedMessage = {
      id: messageData._id || messageData.id || `socket-${Date.now()}`,
      sender: determineMessageSender(messageData.sender),
      message: messageData.text || messageData.message || "",
      timestamp:
        messageData.createdAt ||
        messageData.timestamp ||
        new Date().toISOString(),
      orderDetails: messageData.orderDetails || null,
      type: messageType,
      imageUrl: imageUrl,
      gifUrl: gifUrl,
      gifTitle: gifTitle,
      gifData: messageData.gifData || (gifUrl ? { url: gifUrl, title: gifTitle } : null),
      clientTempId: messageData.clientTempId,
    };
    
    console.log("Transformed message from other user:", transformedMessage);

    setMessages((prevMessages) => {
      const exists = prevMessages.some((msg) => {
        return (
          msg.id === transformedMessage.id ||
          (msg.message === transformedMessage.message &&
            msg.imageUrl === transformedMessage.imageUrl &&
            msg.gifUrl === transformedMessage.gifUrl &&
            Math.abs(
              new Date(msg.timestamp) - new Date(transformedMessage.timestamp)
            ) < 5000)
        );
      });
      
      if (exists) {
        console.log("Message already exists, skipping");
        return prevMessages;
      }
        
        return [...prevMessages, transformedMessage];
      });
    };

    onNewMessage(handleNewMessage);

    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [currentUserId, currentUserRole, onNewMessage, offNewMessage]);

  useEffect(() => {
    if (chatId) {
      try {
        extractUserInfo();
        fetchOrderDetails();
      } catch (error) {
        setError("Authentication failed. Please login again.");
      }
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatId || isSocketConnected) return;

    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [chatId, isSocketConnected]);

  const groupedMessages = messages
    .filter((message) => {
      if (message.type === "order_details") {
        return !!message.orderDetails;
      }

      if (message.type === "text") {
        return !!message.message?.trim();
      }

      if (message.type === "image") {
        return !!message.imageUrl;
      }

      if (message.type === "gif") {
        const hasGifUrl = !!(
          message.gifUrl ||
          (message.gifData && message.gifData.url)
        );
        const hasTextContent = !!message.message?.trim();

        return hasGifUrl || hasTextContent;
      }

      return !!(message.message?.trim() || message.imageUrl || message.gifUrl);
    })
    .reduce((groups, message) => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});

  const currentOrderDetails = fetchedOrderDetails;
  const hasMessages = messages.length > 0;

  return (
    <>
      <ErrorBoundary
        error={error}
        onRetry={() => {
          setError(null);
          fetchOrderDetails();
        }}
        onGoBack={() => navigate("/chat")}
        hasMessages={hasMessages}
      />

      <div className="flex flex-col md:flex-row w-full md:pl-64 h-screen bg-yellow-50">
        <Sidebar />

        <div className="flex flex-col flex-grow h-full">
          <ChatHeader
            onBackClick={handleBackClick}
            orderDetails={orderDetails}
            currentOrderDetails={currentOrderDetails}
            chatId={chatId}
            user={user}
            formatPrice={formatPrice}
          />

          <div className="flex-1 overflow-hidden">
            <div className="h-full max-w-6xl mx-auto p-4">
              <div className="h-full bg-white rounded-lg shadow-sm flex flex-col">
                <ErrorAlert error={error} onDismiss={() => setError(null)} />

                <div className="flex-1 overflow-y-auto p-4">
                  <MessagesContainer
                    loading={loading}
                    groupedMessages={groupedMessages}
                    formatTime={formatTime}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                  />
                  <div ref={messagesEndRef} />
                </div>

                <TypingIndicator typingUsers={typingUsers} />

                <MessageInput
                  newMessage={newMessage}
                  onMessageChange={handleInputChange}
                  onSubmit={handleSendMessage}
                  onTypingStop={handleTypingStop}
                  sendingMessage={sendingMessage}
                  quickMessages={getQuickMessages()}
                  onQuickMessage={handleQuickMessage}
                  selectedImage={selectedImage}
                  onImageSelect={handleImageSelect}
                  onImageRemove={handleImageRemove}
                  imagePreview={imagePreview}
                  selectedGif={selectedGif}
                  onGifSelect={handleGifSelect}
                  onGifRemove={handleGifRemove}
                  onAttachOrderDetails={handleAttachOrderDetails}
                  canAttachOrderDetails={
                    !!(orderDetails || fetchedOrderDetails?.orderDetails)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
