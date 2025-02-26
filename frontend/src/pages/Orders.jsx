import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import image from "../assets/orderHistory-dummy.jpg";
import { FaHistory, FaShoppingBag, FaSync, FaList } from "react-icons/fa";

const OrderItem = ({ order, onOrderClick, onOrderAgain }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const jakartaDate = date.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    return jakartaDate;
  };

  // Function to determine status colors based on order status
  const getStatusStyles = (status) => {
    switch (status) {
      case "Waiting":
        return "bg-yellow-200 text-yellow-800"; // Yellow for waiting
      case "Preparing":
        return "bg-blue-200 text-blue-800"; // Blue for preparing
      case "Completed":
        return "bg-green-300 text-green-800"; // Green for completed
      case "Cancelled":
        return "bg-red-200 text-red-800"; // Red for cancelled
      case "Pending":
        return "bg-purple-200 text-purple-800"; // Red for cancelled
      default:
        return "bg-gray-200 text-gray-800"; // Gray for any other status
    }
  };

  // Show "Order again" button for Completed OR Cancelled status
  const showOrderAgainButton =
    order.status === "Completed" || order.status === "Cancelled";

  const navigate = useNavigate();
  const handleOrderAgains = () => {
    navigate(`/menu-details/${order.menu_id}`);
  };

  return (
    <div
      className="my-3 px-4 py-4 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onOrderClick(order.id)}
    >
      <div className="flex justify-between gap-x-2">
        <div className="flex">
          <div className="flex items-center mr-3">
            <FaShoppingBag className="text-yellow-600 text-lg" />
          </div>
          <div>
            <h4 className="font-bold leading-3 text-sm">Order</h4>
            <p className="text-sm text-slate-700">
              {formatDate(order.created_at) || "13 Nov 2025"}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div
            className={`px-2 py-1 rounded-md font-semibold text-sm ${getStatusStyles(
              order.status || "Completed"
            )}`}
          >
            {order.status || "Completed"}
          </div>
        </div>
      </div>
      <hr className="my-3 border-gray-300" />
      <div className="flex">
        <img
          src={
            order.menu?.menu?.menu_image
              ? `http://localhost:5000/restaurant/uploads/menu/${order.menu.menu.menu_image}`
              : image
          }
          alt="product"
          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200"
        />
        <div className="pt-2 pl-4 flex-1 min-w-0">
          <h2 className="font-bold truncate overflow-hidden text-ellipsis whitespace-nowrap text-base md:text-lg">
            {order.menu?.menu?.menu_name || "Minuman Yang Sangat Mantap banget"}
          </h2>
          <p className="text-slate-600">{order.item_quantity || 1} Item</p>
        </div>
      </div>
      <div className="flex justify-between mt-3">
        <div className="flex flex-col">
          <h2 className="text-sm text-gray-600">Total Order</h2>
          <p className="font-bold text-yellow-600">
            Rp {order.total_price || "89.99"}
          </p>
        </div>
        {showOrderAgainButton && (
          <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOrderAgain(order);
                handleOrderAgains();
              }}
              className="bg-yellow-500 hover:bg-yellow-600 px-4 py-1.5 rounded-lg text-white font-semibold text-sm transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Order again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add CSS to prevent scrolling on page load
  useEffect(() => {
    // Disable scrolling on body
    document.body.style.overflow = "hidden";

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/order/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Check if orders exist; otherwise, set an empty array
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);

      // If the error is a 404, treat it as "no orders" instead of a failure
      if (error.response && error.response.status === 404) {
        setOrders([]); // No orders found
      } else {
        setError(error.message || "Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleOrderAgain = async (order) => {
    console.log("Ordering again:", order);
    // Add your order again logic here
  };

  return (
    <div
      className="flex min-h-screen w-full"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/orders.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden", // Added to prevent scrolling
      }}
    >
      <Sidebar />
      <main
        className={`md:ml-20 flex-1 flex flex-col items-center p-5 pt-8 w-full max-w-full ${
          !loading && !error && orders.length === 0 ? "justify-center" : ""
        }`}
      >
        <div className="w-full max-w-2xl p-8 bg-white shadow-xl rounded-xl mb-6">
          <h2 className="text-3xl font-bold text-center text-yellow-600 mb-6 flex items-center justify-center">
            <FaHistory className="mr-3" /> My Orders
          </h2>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FaList className="text-yellow-500 text-xl mr-3" />
              <div>
                <h3 className="font-medium">Your Past Orders</h3>
                <p className="text-sm text-gray-600">
                  View and reorder your previous or ongoing purchases
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Order List - Allow this to scroll even if page scrolling is disabled */}
          <div className="w-full max-h-[70vh] overflow-y-auto pr-2 overflow-x-hidden">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent mb-2"></div>
                <p className="text-yellow-600 font-medium">Loading orders...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500">
                <p className="font-medium mb-2">Error loading orders</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium mb-2">No orders found</p>
                <p className="text-sm">Your order history will appear here</p>
              </div>
            )}

            {!loading &&
              !error &&
              orders.map((order) => (
                <OrderItem
                  key={order.id}
                  order={order}
                  onOrderClick={() => handleOrderClick(order.order_id)}
                  onOrderAgain={handleOrderAgain}
                />
              ))}
          </div>
        </div>

        {/* Floating My Menu Button */}
        <a
          href="../menu"
          className="fixed bottom-10 right-10 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:bg-yellow-600 transition flex items-center"
        >
          <FaShoppingBag className="mr-2" /> Order Now
        </a>
      </main>
    </div>
  );
};

export default Orders;
