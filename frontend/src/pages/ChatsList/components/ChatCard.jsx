/* eslint-disable react/prop-types */
import { ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaStore, FaComment, FaLock} from "react-icons/fa";
import { IoMdPerson } from "react-icons/io";
import StatusBadge from "../../../components/StatusBadge";
import { API_URL } from "../../../config/api";

const ChatCard = ({ chat, role="seller" }) => {
  console.log("ChatCard props:", chat);
  console.log("Role in ChatCard:", role);
  const navigate = useNavigate();
  const isCompleted = chat.status === "Completed";

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

  // Calculate total price based on order type
  let totalPrice = 0;
  let itemCount = 0;

  if (chat.order_type === "CART" && chat.items) {
    itemCount = chat.items.reduce(
      (total, item) => total + (item.item_quantity || 0),
      0
    );
    totalPrice = chat.items.reduce((total, item) => {
      const menuItem = chat.menu?.find((menu) => menu.menu_id === item.menu_id);
      const menuPrice = parseFloat(menuItem?.menu_price || 0);
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
    if (isCompleted) {
      // Show a message that chat is not available for completed orders
      alert("Chat is not available for completed orders");
      return;
    }

    // Navigate to the chat room with the order ID
    navigate(`/chat/${chat.order_id}`, {
      state: {
        restaurantId: chat.restaurant?.restaurant_id,
        restaurantName: chat.restaurant?.restaurant_name,
        restaurantImage: chat.restaurant?.restaurant_image,
        orderId: chat.order_id,
        orderType: chat.order_type,
        orderStatus: chat.status,
        totalPrice,
        itemCount,
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
      className={`flex bg-white shadow-md rounded-lg border-l-4 transition-all duration-300 ${
        isCompleted
          ? "border-l-gray-400 opacity-70"
          : "border-l-yellow-400 hover:shadow-xl cursor-pointer transform hover:scale-102"
      }`}
      onClick={handleChatClick}
    >
      {/* Restaurant Info Section */}
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center w-full">
            {/* Restaurant Image/Icon */}
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 overflow-hidden flex-shrink-0 ${
                isCompleted ? "bg-gray-100" : "bg-yellow-100"
              }`}
            >
              {
                role === "seller"
                ? (
                  <>
                    {restaurantImage ? (
                      <img
                        src={restaurantImage}
                        alt={chat.user?.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <IoMdPerson
                      className={`text-lg ${
                        restaurantImage ? "hidden" : "flex"
                      } ${isCompleted ? "text-gray-500" : "text-yellow-600"}`}
                    />
                  </>
                )
                
                : (
                  <>
                    {restaurantImage ? (
                      <img
                        src={`${API_URL}/restaurant/uploads/restaurant/${restaurantImage}`}
                        alt={chat.restaurant?.restaurant_name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <FaStore
                      className={`text-lg ${
                        restaurantImage ? "hidden" : "flex"
                      } ${isCompleted ? "text-gray-500" : "text-yellow-600"}`}
                    />
                  </>
                )
              }
            </div>

            {/* Restaurant Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4
                  className={`font-semibold text-lg truncate pr-2 ${
                    isCompleted ? "text-gray-600" : "text-gray-800"
                  }`}
                >
                  {
                    role === "seller" 
                    ? (chat.user?.name || "Customer")
                    : (chat.restaurant?.restaurant_name || "Restaurant")
                  }
                  
                </h4>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {chat.unreadCount > 0 && !isCompleted && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                      {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {formatTime(chat.lastMessageTime)}
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div className="flex items-center space-x-3 mb-2 flex-wrap">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isCompleted
                      ? "bg-gray-100 text-gray-600"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Order #{chat.order_id?.toString().slice(-6)}
                </span>
                <StatusBadge
                  status={chat.status}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                />
              </div>

              {/* Last Message */}
              <p
                className={`text-sm mb-2 line-clamp-2 ${
                  isCompleted ? "text-gray-500" : "text-gray-600"
                }`}
              >
                {chat.lastMessage || "No messages yet"}
              </p>

              {/* Order Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} •{" "}
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="flex items-center">
                  {isCompleted ? (
                    <>
                      <FaLock className="text-gray-400 text-sm mr-2" />
                      <span className="text-xs text-gray-400">Chat ended</span>
                    </>
                  ) : (
                    <>
                      <FaComment className="text-yellow-500 text-sm mr-2" />
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
