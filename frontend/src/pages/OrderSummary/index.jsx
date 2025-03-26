import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import OrderStatus from "./components/OrderStatus";
import OrderHeader from "./components/OrderHeader";
import OrderInfo from "./components/OrderInfo";
import OrderItems from "./components/OrderItems";
import PaymentDetails from "./components/PaymentDetails";
import { API_URL } from "../../config/api";
import Swal from "sweetalert2";

const OrderSummary = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { order_id } = useParams();
  const navigate = useNavigate();

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
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return `Rp ${parseFloat(amount).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
  const menu = order.menu;
  const user = order.user;
  const transaction = order.transaction;
  const currentStep = getStepStatus(order.status);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-amber-50 rounded-xl shadow-lg">
      <BackButton to="/order-list" />
      <div className="mt-4">
        <OrderHeader orderId={order.order_id} status={order.status} />
        <OrderStatus currentStep={currentStep} />
        <OrderInfo
          orderDetails={{ order, user, transaction }}
          formatDate={formatDate}
        />
        <OrderItems
          menu={menu}
          order={order}
          formatCurrency={formatCurrency}
          API_URL={API_URL}
        />
        <PaymentDetails
          menu={menu}
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
