import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token  = localStorage.getItem("token");

  const handleCancel = async(orderId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/order/cancel-order/${orderId}`, {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert(response.data.message);
      navigate("/order-history");
    } catch(err) {
      console.error("Error cancelling order:", err);
      setError(err.message || "Failed to cancel order");
    }
  }

  useEffect(() => {
    console.log("Fetching details for order ID:", orderId);
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          `http://localhost:5000/order/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Order data received:", response.data);
        if (response.data.success && response.data.order) {
          setOrder(response.data.order);
        } else {
          throw new Error("No order data received");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        setError(error.message || "Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handleBack = () => {
    navigate("/order-history");
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 min-h-screen">
        <Sidebar />
        <div className="flex justify-center items-center w-full">
          <div className="text-xl">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 min-h-screen">
        <Sidebar />
        <div className="flex flex-col items-center w-full">
          <div className="text-red-500 text-xl mb-4">Error: {error}</div>
          <button
            onClick={handleBack}
            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
          >
            Back to Order History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 min-h-screen bg-amber-50">
      <Sidebar />
      <div className="flex-grow max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-amber-700 hover:text-amber-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to Order History
          </button>
        </div>

        {order && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-amber-100">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-amber-900">
                Order #{order.order_id}
              </h1>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  order.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : order.status === "Waiting"
                    ? "bg-amber-100 text-amber-800"
                    : order.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-amber-50 p-4 rounded-lg">
              <div className="border-l-4 border-amber-400 pl-4">
                <div className="text-sm text-amber-700 font-medium">
                  Order Date
                </div>
                <div className="text-lg">{formatDate(order.created_at)}</div>
              </div>
              <div className="border-l-4 border-amber-400 pl-4">
                <div className="text-sm text-amber-700 font-medium">
                  Last Updated
                </div>
                <div className="text-lg">{formatDate(order.updated_at)}</div>
              </div>
            </div>

            <div className="border-t border-amber-200 pt-6">
              <h2 className="text-xl font-semibold mb-6 text-amber-900">
                Order Details
              </h2>
              <div className="space-y-4 bg-gradient-to-r from-amber-50 to-white p-6 rounded-lg">
                <div className="flex justify-between items-center py-2 border-b border-amber-100">
                  <span className="text-amber-700 font-medium">Menu Name</span>
                  <span className="text-amber-900">{order.menu.menu_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-amber-100">
                  <span className="text-amber-700 font-medium">
                    Menu Category
                  </span>
                  <span className="text-amber-900">
                    {order.menu.menu_category}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-amber-100">
                  <span className="text-amber-700 font-medium">
                    Price per Item
                  </span>
                  <span className="text-amber-900">
                    Rp{" "}
                    {parseFloat(order.menu.menu_price).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-amber-100">
                  <span className="text-amber-700 font-medium">Quantity</span>
                  <span className="text-amber-900">{order.item_quantity}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-amber-100">
                  <span className="text-amber-700 font-medium">
                    Total Price
                  </span>
                  <span className="text-amber-900">
                    Rp{" "}
                    {(
                      parseFloat(order.menu.menu_price) * order.item_quantity
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-amber-700 font-medium">Status</span>
                  <span className="text-amber-900">{order.status}</span>
                </div>
              </div>
            </div>

            {order.menu.menu_description && (
              <div className="mt-8 p-4 bg-amber-50 rounded-lg">
                <div className="text-sm text-amber-700 font-medium mb-2">
                  Menu Description
                </div>
                <p className="text-amber-900">{order.menu.menu_description}</p>
              </div>
            )}

            {order.menu.menu_image && (
              <div className="mt-8 p-4 bg-amber-50 rounded-lg">
                <img
                  src={`http://localhost:5000/restaurant/uploads/menu/${order.menu.menu_image}`}
                  alt={order.menu.menu_name}
                  className="w-32 h-32 object-contain mx-auto"
                />
              </div>
            )}

            <div className="mt-8 p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center text-amber-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">
                  Order processed at {formatDate(order.created_at)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex justify-between gap-4">
              <button className="w-1/2 py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition" onClick={() => handleCancel(order.order_id)}>
                Cancel
              </button>
              <button className="w-1/2 py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition">
                Pay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
