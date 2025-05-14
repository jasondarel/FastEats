import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaShoppingBag, FaList } from "react-icons/fa";
import getOrderHistoryService from "../../service/orderServices/ordersService";
import SortButton from "../../components/SortButton";
import OrderItem from "./components/OrderItem";
import OrderStateMessage from "./components/OrderStateMessage";
import LoadingState from "../../components/LoadingState";
import YellowBackgroundLayout from "./components/Background";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date"); // Default sort by date
  const [sortOrder, setSortOrder] = useState("desc"); // Default newest first

  // Sort options configuration for the SortButton
  const sortOptions = [
    {
      label: "Date",
      options: [
        { field: "date", direction: "desc", label: "Date (Newest)" },
        { field: "date", direction: "asc", label: "Date (Oldest)" },
      ],
    },
    {
      label: "Price",
      options: [
        { field: "price", direction: "asc", label: "Price (Lowest)" },
        { field: "price", direction: "desc", label: "Price (Highest)" },
      ],
    },
  ];

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
      const response = await getOrderHistoryService(token);

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

  // Handle sort change from SortButton component
  const handleSortChange = (field, direction) => {
    setSortBy(field);
    setSortOrder(direction);
  };

  // Function to sort orders based on criteria
  const getSortedOrders = () => {
    if (!orders || orders.length === 0) return [];

    const sortedOrders = [...orders];

    if (sortBy === "date") {
      sortedOrders.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === "price") {
      sortedOrders.sort((a, b) => {
        const priceA = parseFloat(a.total_price || 0);
        const priceB = parseFloat(b.total_price || 0);
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });
    }

    return sortedOrders;
  };

  // Get sorted orders
  const sortedOrders = getSortedOrders();

  return (
    <YellowBackgroundLayout>
      <div className="w-full max-w-xl p-6 bg-white shadow-xl rounded-xl flex flex-col max-h-[90vh]">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-yellow-600 mb-4 flex items-center justify-center">
          <FaHistory className="mr-3" /> My Orders
        </h2>

        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
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

        {/* Sort Button */}
        {!loading && !error && orders.length > 0 && (
          <div className="mb-3 flex justify-end items-center">
            <SortButton
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              options={sortOptions}
            />
          </div>
        )}

        {/* Scrollable Order List - dynamic height calculation */}
        <div className="flex-1 overflow-y-auto pr-2 overflow-x-hidden min-h-0">
          {loading && <LoadingState />}

          {error && <OrderStateMessage type="error" subMessage={error} />}

          {!loading && !error && orders.length === 0 && (
            <OrderStateMessage type="empty" />
          )}

          {!loading &&
            !error &&
            sortedOrders.map((order) => (
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
        href="../home"
        className="fixed bottom-10 right-10 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:bg-yellow-600 transition flex items-center"
      >
        <FaShoppingBag className="mr-2" /> Order Now
      </a>
    </YellowBackgroundLayout>
  );
};

export default Orders;
