/* eslint-disable react/prop-types */
import { ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaStore, FaComment, FaLock } from "react-icons/fa";
import { IoMdPerson } from "react-icons/io";
import StatusBadge from "../../../components/StatusBadge";
import { API_URL } from "../../../config/api";
import { useState } from "react";
import { current } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const ChatCard = ({ chat, role = "seller" }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isCompleted = chat.orderDetails?.status === "Completed" || false;
  const { user } = useSelector((state) => state.auth);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  let totalPrice = 0;
  let itemCount = 0;

  if (chat.orderDetails) {
    itemCount = chat.orderDetails.items.reduce(
      (total, item) => total + (item.item_quantity || 0),
      0
    );
    totalPrice = chat.orderDetails.items.reduce((total, item) => {
      const menuPrice = parseFloat(item.menuDetails?.menu_price || 0);
      const quantity = item.item_quantity || 0;
      return total + menuPrice * quantity;
    }, 0);
  } else if (chat.order_type === "CHECKOUT") {
    itemCount = chat.item_quantity || 1;
    const menuItem = chat.menu?.[0];
    const menuPrice = parseFloat(menuItem?.menu_price || 0);
    totalPrice = menuPrice * itemCount;
  }

  const handleChatClick = () => {
    console.log("Chat clicked:", chat);

    let locationState;
    if (role === "seller") {
      locationState = {
        customerName: chat.user?.name || "Customer",
        restaurantName: chat.restaurant?.restaurantName || "Restaurant",
        customerImage: chat.user?.profile_photo || null,
        orderId: chat.order_id,
        orderType: chat.order_type,
        totalPrice,
        itemCount,
      };
    } else {
      locationState = {
        restaurantName: chat.restaurant?.restaurantName,
        restaurantImage: `${API_URL}/restaurant/uploads/restaurant/${chat.restaurant?.restaurantImage}`,
        orderId: chat.order_id,
        orderType: chat.order_type,
        totalPrice,
        itemCount,
      };
    }
    console.log("Navigating to chat with state:", locationState);
    navigate(`/chat/${chat.chat_id}`, {
      state: {
        ...locationState,
      },
    });
  };

  const getRestaurantImage = () => {
    if (role === "seller") {
      return chat.user?.profile_photo || null;
    } else {
      return chat.restaurant?.restaurant_image || null;
    }
  };

  const restaurantImage = getRestaurantImage();

  return (
    <div
      className={`flex bg-white shadow-md rounded-lg border-l-4 border-l-yellow-400 cursor-pointer transition-all duration-300 ease-in-out transform ${
        isHovered 
          ? "shadow-xl scale-[1.02] -translate-y-1" 
          : "hover:shadow-lg"
      } ${chat.isAnimating ? 'animate-pulse-subtle' : ''}`}
      onClick={handleChatClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center w-full">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 overflow-hidden flex-shrink-0 bg-yellow-100 transition-all duration-300 ${
                isHovered ? 'transform scale-110' : ''
              }`}
            >
              {role === "seller" ? (
                <>
                  {restaurantImage ? (
                    <img
                      src={restaurantImage}
                      alt={chat.user?.name}
                      className={`h-full w-full object-cover transition-transform duration-300 ${
                        isHovered ? 'scale-110' : ''
                      }`}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <IoMdPerson
                    className={`text-lg text-yellow-600 transition-all duration-300 ${
                      restaurantImage ? "hidden" : "flex"
                    } ${
                      isHovered ? 'scale-110' : ''
                    }`}
                  />
                </>
              ) : (
                <>
                  {chat.restaurant.restaurantImage ? (
                    <img
                      src={`${API_URL}/restaurant/uploads/restaurant/${chat.restaurant.restaurantImage}`}
                      alt={chat.restaurant?.restaurantName}
                      className={`h-full w-full object-cover transition-transform duration-300 ${
                        isHovered ? 'scale-110' : ''
                      }`}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <FaStore
                    className={`text-lg text-yellow-600 transition-all duration-300 ${
                      restaurantImage ? "hidden" : "flex"
                    } ${
                      isHovered ? 'scale-110' : ''
                    }`}
                  />
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4
                  className={`font-semibold text-lg text-gray-800 truncate pr-2 transition-colors duration-300 ${
                    isHovered ? 'text-yellow-700' : ''
                  }`}
                >
                  {role === "seller"
                    ? chat.user?.name || "Customer"
                    : chat.restaurant?.restaurantName || "Restaurant"}
                </h4>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {chat.unreadCount > 0 && !isCompleted && (
                    <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full transition-all duration-300 ${
                      isHovered ? 'scale-110 animate-bounce' : ''
                    }`}>
                      {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-2 flex-wrap">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 transition-all duration-300 ${
                    isHovered ? 'bg-yellow-200 scale-105' : ''
                  }`}
                >
                  Order #{chat.order_id?.toString().slice(-6)}
                </span>
                <div className={`transition-transform duration-300 ${
                  isHovered ? 'scale-105' : ''
                }`}>
                  <StatusBadge
                    status={chat.orderDetails.status}
                    className="px-2 py-1 rounded-full text-xs font-medium"
                  />
                </div>
              </div>

              <div
                className={`flex items-center text-sm text-gray-600 mb-2 transition-colors duration-300 ${
                  isHovered ? 'text-gray-700' : ''
                }`}
              >
                <p className="line-clamp-2">
                  {chat.lastMessage || "No messages yet"}
                </p>
                {chat.lastMessageIcon && (
                  <span className={`flex-shrink-0 ml-1 transition-transform duration-300 ${
                    isHovered ? 'scale-110' : ''
                  }`}>
                    {chat.lastMessageIcon}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`text-xs text-gray-500 transition-colors duration-300 ${
                    isHovered ? 'text-gray-600' : ''
                  }`}>
                    {itemCount} item{itemCount !== 1 ? "s" : ""} •{" "}
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="flex items-center">
                 <FaComment className={`text-yellow-500 text-sm mr-2 transition-all duration-300 ${
                     isHovered ? 'scale-110 text-yellow-600' : ''
                    }`} />
                    <ChevronRightIcon className={`h-5 w-5 text-gray-400 transition-all duration-300 ${
                      isHovered ? 'text-yellow-500 translate-x-1' : ''
                    }`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ChatCard;