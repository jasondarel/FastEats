import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import OrderStatus from "./components/OrderStatus";
import OrderHeader from "./components/OrderHeader";
import OrderInfo from "./components/OrderInfo";
import OrderItems from "./components/OrderItems";
import PaymentDetails from "./components/PaymentDetails";
import { API_URL} from "../../config/api";
import Swal from "sweetalert2";
import io from "socket.io-client";
import { BsChatLeftDots } from "react-icons/bs";
import {
  getChatsService,
  createChatService,
} from "../../service/chatServices/chatsListService";

const OrderSummary = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { order_id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/order/restaurant-order/${order_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch order summary.");
        }

        const data = await response.json();
        console.log("Order summary data:", data.order);
        setOrderData(data.order);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order summary:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrderSummary();
  }, [order_id]);

  useEffect(() => {
    if (!order_id) return;
    socketRef.current = io(API_URL, {
      path: "/order/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current.on("orderUpdated", (updatedOrder) => {
      console.log("Order updated:", updatedOrder);
      if (
        updatedOrder.order_id === order_id ||
        updatedOrder.order_id === Number(order_id)
      ) {
        setOrderData((prev) => {
          if (!prev || !prev.order) return prev;
          return { ...prev, order: { ...prev.order, ...updatedOrder } };
        });
      }
    });

    socketRef.current.on("orderCompleted", (completedOrder) => {
      console.log("Order completed:", completedOrder);
      if (
        completedOrder.order_id === order_id ||
        completedOrder.order_id === Number(order_id)
      ) {
        setOrderData((prev) => {
          if (!prev) return prev;
          return { ...prev, status: completedOrder.status };
        });
      }
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [order_id]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return `Rp ${parseFloat(amount).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculateTotalWithAddons = (items, addonPrice = 0) => {
    if (!Array.isArray(items)) return 0;
    
    const itemsTotal = items.reduce((total, item) => {
      const menuPrice = parseFloat(item.menu_price || 0);
      const quantity = item.item_quantity || 1;
      return total + (menuPrice * quantity);
    }, 0);
    
    return itemsTotal + parseFloat(addonPrice);
  };

  const handleChatWithCustomer = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const existingChatsResponse = await getChatsService(token);

      if (existingChatsResponse.success) {
        const existingChat = existingChatsResponse.dataChats?.find(
          (chat) => String(chat.orderId) === String(order_id)
        );

        if (existingChat) {
          console.log("Chat already exists, navigating to:", existingChat._id);

          let itemCount = 0;
          let totalPrice = 0;

          if (Array.isArray(orderData.items)) {
            itemCount = orderData.items.reduce(
              (total, item) =>
                total + (item.item_quantity ||  1),
              0
            );
            totalPrice = calculateTotalWithAddons(orderData.items, orderData.addon_price);
            
            navigate(`/chat/${existingChat._id}`, {
              state: {
                customerName:
                  orderData.user?.name || existingChat.user?.name || "Customer",
                customerImage:
                  orderData.user?.profile_photo ||
                  existingChat.user?.profile_photo ||
                  null,
                orderId: orderData.order_id || order_id,
                orderType: orderData.order_type || "CHECKOUT",
                totalPrice,
                itemCount,
              },
            });
            return;
          }
        }
      }

      console.log("Creating new chat for order:", order_id);
      const chatResult = await createChatService(order_id, token);
      
      if (chatResult.success && chatResult.dataChat?.chat) {
        const chatId = chatResult.dataChat.chat._id;
        console.log("Chat created successfully, navigating to:", chatId);

        const itemCount =
          orderData.items?.reduce(
            (total, item) => total + (item.item_quantity || 0),
            0
          ) ||
          orderData.item_quantity ||
          1;

        const totalPrice = calculateTotalWithAddons(orderData.items, orderData.addon_price) ||
          parseFloat(orderData.menu_price || 0) * (orderData.item_quantity || 1);

        navigate(`/chat/${chatId}`, {
          state: {
            customerName: orderData.user?.name || "Customer",
            customerImage: orderData.user?.profile_photo || null,
            orderId: orderData.order_id || order_id,
            orderType: orderData.order_type || "CHECKOUT",
            totalPrice,
            itemCount,
          },
        });
      } else {
        throw new Error("Failed to create chat - invalid response");
      }
    } catch (error) {
      console.error("Error handling chat with customer:", error);

      Swal.fire({
        title: "Error!",
        text: "Failed to open chat with customer. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d97706",
      });
    }
  };

  const handleDeliverOrder = async () => {
    try {
      const response = await fetch(
        `${API_URL}/order/deliver-order/${order_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Order delivered successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#d97706",
        });
        const updatedOrderData = await response.json();
        setOrderData(updatedOrderData);
        navigate("/order-list");
      } else {
        throw new Error("Failed to complete order");
      }
    } catch (err) {
      console.error("Error completing order:", err);
      Swal.fire({
        title: "Error!",
        text: "Failed to complete the order. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d97706",
      });
    }
  };

  const getStepStatus = (currentStatus) => {
    const statusMap = {
      Pending: "Payment Pending",
      Processing: "Preparing",
      Delivering: "Delivering",
      Completed: "Completed",
      Cancelled: "Cancelled",
    };
    return statusMap[currentStatus] || currentStatus;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg flex justify-center items-center h-96">
        <p className="text-lg font-semibold">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg flex justify-center items-center h-96">
        <p className="text-lg font-semibold text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg flex justify-center items-center h-96">
        <p className="text-lg font-semibold">No order data found.</p>
      </div>
    );
  }

  const order = orderData;
  const menuItems = order.items;
  const user = order.user;
  const transaction = order.transaction;
  const currentStep = getStepStatus(order.status);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-amber-50 rounded-xl shadow-lg">
      <BackButton />
      <div className="mt-4">
        <OrderHeader orderId={order.order_id} status={order.status} />
        <OrderStatus currentStep={currentStep} />
        <OrderInfo
          orderDetails={{ order, user, transaction }}
          formatDate={formatDate}
        />
        <div className="flex justify-center gap-4">
          {(order.status === "Preparing" || order.status === "Delivering") && (
            <div className="flex justify-center gap-2 mb-4 items-center">
              <button
                onClick={handleChatWithCustomer}
                className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 hover:cursor-pointer text-white rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                <BsChatLeftDots color="white" size={18}/>
                Chat with Customer
              </button>
            </div>
          )}
        </div>
        <OrderItems
          menuItems={menuItems}
          order={order}
          formatCurrency={formatCurrency}
          API_URL={API_URL}
        />
        <PaymentDetails
          menuItems={menuItems}
          order={order}
          transaction={transaction}
          formatCurrency={formatCurrency}
        />

        <div className="flex justify-end gap-4">
          {order.status === "Preparing" && (
            <button
              className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 hover:cursor-pointer transition"
              onClick={handleDeliverOrder}
            >
              Deliver Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;