import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import OrderStatus from "./components/OrderStatus";
import OrderHeader from "./components/OrderHeader";
import OrderInfo from "./components/OrderInfo";
import OrderItems from "./components/OrderItems";
import PaymentDetails from "./components/PaymentDetails";
import { API_URL, ORDER_URL } from "../../config/api";
import Swal from "sweetalert2";
import io from "socket.io-client";

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
        setOrderData(data);
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
    socketRef.current = io(ORDER_URL, {
      transports: ["websocket"],
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

    // Listen for order completions
    socketRef.current.on("orderCompleted", (completedOrder) => {
      if (
        completedOrder.order_id === order_id ||
        completedOrder.order_id === Number(order_id)
      ) {
        setOrderData((prev) => {
          if (!prev || !prev.order) return prev;
          return { ...prev, order: { ...prev.order, ...completedOrder } };
        });
      }
    });

    // Optionally handle socket errors
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

  const handleChatWithCustomer = () => {
    navigate(`/chat/${order_id}`);
  };

  const handleCompleteOrder = async () => {
    try {
      const response = await fetch(
        `${API_URL}/order/complete-order/${order_id}`,
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
          text: "Order completed successfully!",
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

  if (!orderData || !orderData.success || !orderData.order) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg flex justify-center items-center h-96">
        <p className="text-lg font-semibold">No order data found.</p>
      </div>
    );
  }

  const order = orderData.order;
  const menuItems = order.menu;
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
          {order.status === "Preparing" && (
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={handleChatWithCustomer}
                className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 hover:cursor-pointer text-white rounded-lg transition-colors duration-200 font-medium text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
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
              onClick={handleCompleteOrder}
            >
              Complete Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
