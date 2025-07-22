import { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import { API_URL, CHAT_URL } from "../../../config/api";

export const useChatSocket = (
  chatId,
  currentUserId,
  currentUserRole,
  orderDetails
) => {
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const setupSocket = () => {
    if (socketRef.current) return;

    try {
      console.log("Attempting to connect to Socket.IO server at:", CHAT_URL);

      socketRef.current = io(API_URL, {
        path: "/chat/socket.io",
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Socket connected:", socketRef.current.id);
        setIsSocketConnected(true);

        console.log(`Joining chat room: chat_${chatId}`);
        socketRef.current.emit("join_room", `chat_${chatId}`);

        if (currentUserId) {
          console.log(`Joining user room: user_${currentUserId}`);
          socketRef.current.emit("join_room", `user_${currentUserId}`);
        }
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
        setIsSocketConnected(false);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
        setIsSocketConnected(false);

        if (reason === "io server disconnect") {
          console.log(
            "Server disconnected the socket. Attempting to reconnect..."
          );
          socketRef.current.connect();
        }
      });

      socketRef.current.onAny((event, ...args) => {
        console.log(`🔔 Received Socket.IO event: ${event}`, args);
      });

      socketRef.current.on("user_typing", (data) => {
        console.log("User typing update:", data);

        if (data.userId === currentUserId) return;

        if (data.isTyping) {
          setTypingUsers((prev) => {
            if (prev.some((user) => user.userId === data.userId)) {
              return prev;
            }
            return [...prev, { userId: data.userId, username: data.username }];
          });
        } else {
          setTypingUsers((prev) =>
            prev.filter((user) => user.userId !== data.userId)
          );
        }
      });

      return () => {
        console.log("Cleaning up socket connection");
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } catch (err) {
      console.error("Socket setup error:", err);
      throw new Error(`Socket connection failed: ${err.message}`);
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("typing", {
          chatId,
          userId: currentUserId,
          username:
            currentUserRole === "seller"
              ? orderDetails?.customerName || "Customer"
              : orderDetails?.restaurantName || "Restaurant",
          isTyping: true,
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
        socketRef.current.emit("typing", {
          chatId,
          userId: currentUserId,
          username:
            currentUserRole === "seller"
              ? orderDetails?.customerName || "Customer"
              : orderDetails?.restaurantName || "Restaurant",
          isTyping: false,
        });
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const emitMessage = (messageData) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", messageData);
    }
  };

  const onNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("new_message", callback);
    }
  };

  const offNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.off("new_message", callback);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      if (isTyping) {
        socketRef.current.emit("typing", {
          chatId,
          userId: currentUserId,
          username: currentUserRole === "seller" ? "Restaurant" : "Customer",
          isTyping: false,
        });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  useEffect(() => {
    if (currentUserId && chatId) {
      setupSocket();
    }

    return disconnect;
  }, [currentUserId, chatId]);

  return {
    isSocketConnected,
    isTyping,
    typingUsers,
    handleTypingStart,
    handleTypingStop,
    emitMessage,
    onNewMessage,
    offNewMessage,
    disconnect,
  };
};
