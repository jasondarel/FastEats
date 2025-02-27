import React, { useState, useEffect } from "react";
import { CheckIcon } from "lucide-react";
import { useParams } from "react-router-dom";

const OrderSummary = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { order_id } = useParams();

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/order/restaurant-order/${order_id}`,
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
  console.log(menu);
  const user = order.user;
  const transaction = order.transaction;

  console.log(order.status, menu, user, transaction);

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleCompleteOrder = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/order/complete-order/${order_id}`,{
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        alert("Order completed successfully!");
    }catch(err) {
      console.error("Error completing order:", err);
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `IDR ${parseFloat(amount).toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getStepStatus = (currentStatus) => {
    const statusMap = {
      "Pending": "Payment Pending",
      "Processing": "Preparing",
      "Completed": "Completed",
      "Cancelled": "Cancelled"
    };
    return statusMap[currentStatus] || currentStatus;
  };

  const currentStep = getStepStatus(order.status);
  const steps = ["Waiting", "Pending", "Preparing", "Completed"];
  
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <header className="flex justify-between items-center pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Order Details</h1>
          <p>Order #{order.order_id}</p>
        </div>
        <div className="inline-block bg-yellow-400 text-gray-800 px-4 py-2 rounded-full font-semibold text-sm">
          {order.status}
        </div>
      </header>

      <div className="flex justify-between mb-8 relative before:content-[''] before:absolute before:top-4 before:left-0 before:right-0 before:h-[2px] before:bg-gray-300">
        {steps.map((step, index) => {
          const stepIndex = steps.indexOf(currentStep);
          const isActive = step === currentStep;
          const isCompleted = steps.indexOf(step) < stepIndex;
          
          return (
            <div
              key={index}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {index === 0 ? (
                  "📦"
                ) : index === 1 ? (
                  "⌛"
                ) : index === 2 ? (
                  "🚚"
                ) : (
                  <CheckIcon />
                )}
              </div>
              <div
                className={`text-sm font-semibold ${
                  isActive
                    ? "text-amber-600"
                    : isCompleted
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Order Date", value: formatDate(order.created_at) },
          { label: "Customer", value: `${user.name} (${user.email})` },
          { label: "Payment Method", value: transaction?.payment_type?.toUpperCase() || "QRIS" },
          { label: "Payment Expires", value: formatDate(transaction?.expiry_time) },
        ].map((item, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">{item.label}</div>
            <div className="font-semibold text-lg">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg mb-4">
          <img
            src={menu.menu_image ? `http://localhost:5000/restaurant/uploads/menu/${menu.menu_image}` : "/api/placeholder/80/80"}
            alt={menu.menu_name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="text-lg font-semibold">{menu.menu_name}</div>
            <div className="text-sm text-gray-600 mb-2">
              {menu.menu_description}
            </div>
            <div className="text-blue-900 font-semibold">
              {formatCurrency(menu.menu_price)}
            </div>
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-lg font-semibold">
            x{order.item_quantity}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        {[
          { 
            label: "Subtotal", 
            value: formatCurrency(parseFloat(menu.menu_price) * order.item_quantity) 
          },
          { label: "Tax", value: formatCurrency(0) },
          { label: "Delivery Fee", value: formatCurrency(0) },
        ].map((item, index) => (
          <div key={index} className="flex justify-between mb-2">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
        <div className="flex justify-between mt-4 pt-4 border-t border-dashed border-gray-300">
          <span className="font-semibold text-lg">Total</span>
          <span className="font-bold text-xl text-blue-900">
            {transaction ? formatCurrency(transaction.amount) : formatCurrency(parseFloat(menu.menu_price) * order.item_quantity)}
          </span>
        </div>
        
      </div>
      <div className="flex justify-end gap-4">
        {order.status === "Preparing" && (
          <button className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:opacity-90"
          onClick={() => handleCompleteOrder()}>
            Complete Order
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;