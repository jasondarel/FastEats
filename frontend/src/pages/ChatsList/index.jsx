/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from "react";
import { MdGif } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import { getChatsService } from "../../service/chatServices/chatsListService";
import { API_URL } from "../../config/api";
import { useSelector } from "react-redux";
import io from "socket.io-client";

// Component imports
import ChatHeader from "./components/ChatHeader";
import EmptyChatsState from "./components/EmptyChatsState";
import ChatListSection from "./components/ChatListSection";
import LoadingPage from "./components/LoadingPage";
import ErrorPage from "./components/ErrorPage";
import e from "cors";

const ChatsList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatingChats, setAnimatingChats] = useState(new Map());
  const { user } = useSelector((state) => state.auth);
  const socketRef = useRef(null);
  const chatRefs = useRef(new Map());
  const containerRef = useRef(null);

  const fetchChats = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await getChatsService(token);

      if (response.success) {
        console.log("Fetched chats:", response.dataChats);
        setChats(response?.dataChats || []);
      } else {
        throw new Error(response.message || "Failed to fetch chats");
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(
        "An error occurred while fetching chats: " + (err.message || err)
      );
    } finally {
      setLoading(false);
    }
  };

  const capturePositions = (chatList) => {
    const positions = new Map();
    chatList.forEach((chat) => {
      const matchField = chat._id ? '_id' : 'orderId';
      const matchValue = chat._id || chat.orderId;
      const element = chatRefs.current.get(matchValue);
      if (element) {
        const rect = element.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
        positions.set(matchValue, {
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left,
          width: rect.width,
          height: rect.height
        });
      }
    });
    return positions;
  };

  const animatePositionChanges = (oldPositions, newChatList) => {
    const newAnimatingChats = new Map();
    
    newChatList.forEach((chat, newIndex) => {
      const matchField = chat._id ? '_id' : 'orderId';
      const matchValue = chat._id || chat.orderId;
      const element = chatRefs.current.get(matchValue);
      const oldPosition = oldPositions.get(matchValue);
      
      if (element && oldPosition) {
        const newRect = element.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
        const newPosition = {
          top: newRect.top - containerRect.top,
          left: newRect.left - containerRect.left
        };

        const deltaY = oldPosition.top - newPosition.top;
        const deltaX = oldPosition.left - newPosition.left;

        if (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5) {
          element.style.transition = 'none';
          element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          element.style.zIndex = '1000';
          
          newAnimatingChats.set(matchValue, {
            element,
            deltaX,
            deltaY,
            startTime: Date.now()
          });

          requestAnimationFrame(() => {
            element.style.transition = 'transform 600ms cubic-bezier(0.4, 0.0, 0.2, 1)';
            element.style.transform = 'translate(0px, 0px)';
          });
        }
      }
    });

    if (newAnimatingChats.size > 0) {
      setAnimatingChats(newAnimatingChats);
      
      setTimeout(() => {
        newAnimatingChats.forEach(({ element }) => {
          if (element) {
            element.style.transition = '';
            element.style.transform = '';
            element.style.zIndex = '';
          }
        });
        setAnimatingChats(new Map());
      }, 650);
    }
  };

  const handleChatUpdate = (updatedChat) => {
    setChats((prevChats) => {
      const matchField = updatedChat._id ? '_id' : 'orderId';
      const matchValue = updatedChat._id || updatedChat.orderId;
      
      const oldPositions = capturePositions(prevChats);
      
      const existingIndex = prevChats.findIndex((chat) => chat[matchField] === matchValue);
      let newChats;
      
      if (existingIndex !== -1) {
        const updatedChats = prevChats.map((chat, index) =>
          index === existingIndex ? { ...chat, ...updatedChat } : chat
        );
        
        newChats = updatedChats.sort((a, b) => {
          const aTime = new Date(a.lastMessage?.timestamp || a.updatedAt);
          const bTime = new Date(b.lastMessage?.timestamp || b.updatedAt);
          return bTime - aTime;
        });
      } else {
        newChats = [updatedChat, ...prevChats];
      }

      setTimeout(() => {
        animatePositionChanges(oldPositions, newChats);
      }, 0);

      return newChats;
    });
  };

  useEffect(() => {
    socketRef.current = io(API_URL, {
      path: "/chat/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current.on("refresh_chat_list", ({updatedChat}) => {
      handleChatUpdate(updatedChat);
    });

    fetchChats();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const getMessageDisplay = (lastMessage) => {
    if (!lastMessage) {
      return {
        text: "No messages yet",
        icon: null,
      };
    }

    switch (lastMessage.messageType) {
      case "gif":
        return {
          text: "GIF",
          icon: <MdGif className="text-gray-500 text-lg mr-1" />,
        };
      case "image":
        return {
          text: "Image",
          icon: <FaImage className="text-gray-500 text-sm mr-1" />,
        };
      case "order_details":
        return {
          text: "Order Details",
        };
      default:
        return {
          text: lastMessage.text || "No messages yet",
          icon: null,
        };
    }
  };

  const transformedChats = chats.map((chat) => {
    const getOrderStatus = () => {
      if (chat.orderDetails?.status) {
        const orderStatus = chat.orderDetails.status.toLowerCase();
        if (
          orderStatus === "completed"
        ) {
          return "Completed";
        } else if (
          orderStatus === "preparing"
        ) {
          return "Preparing";
        } else if (orderStatus === "pending" || orderStatus === "waiting") {
          return "Waiting";
        } else if (orderStatus === "cancelled") {
          return "Cancelled";
        }
      }

      if (chat.status) {
        const chatStatus = chat.status.toLowerCase();
        if (
          chatStatus === "completed" 
        ) {
          return "Completed";
        } else if (chatStatus === "active" || chatStatus === "ongoing") {
          return "Preparing";
        } else if ( chatStatus === "pending" || chatStatus === "waiting") {
          return "Waiting";
        } else if (chatStatus === "cancelled") {
          return "Cancelled";
        }
      }

      return "Waiting";
    };

    const messageDisplay = getMessageDisplay(chat.lastMessage);
    const chatId = chat._id || chat.orderId;

    return {
      chat_id: chat._id,
      order_id: chat.orderId || -1,
      order_type: chat.orderReference ? "CHECKOUT" : "CART",
      status: getOrderStatus(),
      created_at: chat.createdAt,
      updated_at: chat.updatedAt,
      lastMessageTime: chat.lastMessage?.timestamp || chat.updatedAt,
      lastMessage: messageDisplay.text,
      lastMessageIcon: messageDisplay.icon,
      unreadCount: chat.unreadCountUser || 0,
      isAnimating: animatingChats.has(chatId),
      restaurant: {
        restaurant_id: chat.restaurant?.restaurant_id,
        restaurant_name: chat.restaurant?.restaurant_name || "Restaurant",
        restaurant_image: chat.restaurant?.restaurant_image || null,
        restaurant_address:
          chat.restaurant?.restaurant_address || "Address not available",
      },
      user: chat.user || null,
      orderDetails: chat.orderDetails || null,
    };
  });

  const activeChats = transformedChats.filter(
    (chat) => chat.status === "Preparing" || chat.status === "Waiting"
  );

  const completedChats = transformedChats.filter(
    (chat) => chat.status === "Completed"
  );

  const cancelledChats = transformedChats.filter(
    (chat) => chat.status === "Cancelled"
  );

  const sortedActiveChats = activeChats.sort(
    (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  );

  const sortedCompletedChats = completedChats.sort(
    (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  );

  const sortedCancelledChats = cancelledChats.sort(
    (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  );

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} onRetry={fetchChats} userRole={user?.role} />;
  }

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen overflow-auto bg-yellow-50">
      <Sidebar />
      <div className="flex flex-col flex-grow w-full overflow-auto md:px-6 lg:px-8 max-w-7xl mx-auto">
        <ChatHeader userRole={user?.role} />

        {transformedChats.length === 0 ? (
          <EmptyChatsState />
        ) : (
          <div ref={containerRef} className="w-full max-w-6xl space-y-8 relative">
            <ChatListSection
              chats={sortedActiveChats}
              title="Active Conversations"
              isActive={true}
              userRole={user?.role}
              chatRefs={chatRefs}
            />

            {sortedActiveChats.length > 0 && sortedCompletedChats.length > 0 && (
              <div className="border-t border-gray-200 my-6"></div>
            )}

            <ChatListSection
              chats={sortedCompletedChats}
              title="Completed Orders"
              isActive={false}
              userRole={user?.role}
              chatRefs={chatRefs}
            />

            {sortedCompletedChats.length > 0 && sortedCancelledChats.length > 0 && (
              <div className="border-t border-gray-200 my-6"></div>
            )}

            <ChatListSection 
              chats={sortedCancelledChats}
              title="Cancelled Orders"
              isActive={false}
              userRole={user?.role}
              chatRefs={chatRefs}
            />
              
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsList;