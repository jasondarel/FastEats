import React from "react";
import { FaComments, FaComment } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * Chat button component for initiating conversations between seller and customer
 * @param {Object} props - Component props
 * @param {Object} props.order - Order object containing customer and order details
 * @param {string} props.variant - Button variant: 'primary', 'secondary', 'icon-only'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Custom click handler (optional)
 */
const ChatButton = ({
  order,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
}) => {
  const navigate = useNavigate();

  // Handle chat button click
  const handleChatClick = (e) => {
    e.stopPropagation(); // Prevent triggering parent click events

    if (onClick) {
      onClick(order);
    } else {
      // Default navigation to chat room
      navigate(`/chat/${order.order_id}`, {
        state: {
          customerId: order.user?.user_id,
          customerName: order.user?.name || "Customer",
          orderId: order.order_id,
          orderType: order.order_type,
        },
      });
    }
  };

  // Define button styles based on variant and size
  const getButtonStyles = () => {
    const baseStyles =
      "flex items-center justify-center transition-colors duration-200 rounded-lg font-medium";

    const variantStyles = {
      primary:
        "bg-yellow-500 text-white border border-yellow-600 hover:bg-yellow-600",
      secondary:
        "bg-white text-yellow-600 border border-yellow-500 hover:bg-yellow-50",
      "icon-only":
        "bg-yellow-100 text-yellow-600 border border-yellow-200 hover:bg-yellow-200",
    };

    const sizeStyles = {
      sm: variant === "icon-only" ? "p-2" : "px-3 py-1.5 text-sm",
      md: variant === "icon-only" ? "p-2.5" : "px-4 py-2 text-sm",
      lg: variant === "icon-only" ? "p-3" : "px-6 py-3 text-base",
    };

    return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  };

  // Get icon size based on button size
  const getIconSize = () => {
    const iconSizes = {
      sm: "w-4 h-4",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };
    return iconSizes[size];
  };

  // Choose icon based on variant
  const ChatIcon = variant === "icon-only" ? FaComment : FaComments;

  return (
    <button
      onClick={handleChatClick}
      className={getButtonStyles()}
      title={`Chat with ${order.user?.name || "Customer"}`}
    >
      <ChatIcon
        className={`${getIconSize()} ${variant !== "icon-only" ? "mr-2" : ""}`}
      />
      {variant !== "icon-only" && (
        <span>{variant === "primary" ? "Chat with Customer" : "Chat"}</span>
      )}
    </button>
  );
};

export default ChatButton;
