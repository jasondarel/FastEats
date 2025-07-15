import { useEffect, useState, useRef } from "react";
import { FaHistory, FaShoppingBag, FaList } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import OrderCard from "./components/OrderCard";
import LoadingState from "../../components/LoadingState";
import { API_URL, ORDER_URL } from "../../config/api";
import SortButton from "../../components/SortButton";
import DateFilterButton from "../../components/DateFilterButton";
import io from "socket.io-client";

const OrderList = () => {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDate, setSelectedDate] = useState(null);

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

  // --- SOCKET.IO SETUP ---
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(ORDER_URL, {
      transports: ["websocket"],
      // If you need authentication, add: auth: { token }
    });

    // Listen for order updates
    socketRef.current.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === updatedOrder.order_id
            ? { ...order, ...updatedOrder }
            : order
        )
      );
    });

    // Listen for order completions (if your backend emits this event)
    socketRef.current.on("orderCompleted", (completedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === completedOrder.order_id
            ? { ...order, ...completedOrder }
            : order
        )
      );
    });

    // Listen for creation of new orders
    socketRef.current.on("orderCreated", (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    // Optionally handle socket errors
    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/order/orders-by-restaurant`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else {
        setErrorCode(data.code || 404);
        setError(data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("An error occurred while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let result = [...orders];
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      result = result.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startOfDay && orderDate <= endOfDay;
      });
    }

    if (sortBy === "date") {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === "price") {
      result.sort((a, b) => {
        let priceA = 0;
        if (a.order_type === "CART" && a.items) {
          priceA = a.items.reduce((total, item) => {
            const menu = a.menu?.find((m) => m.menu_id === item.menu_id);
            return (
              total +
              parseFloat(menu?.menu_price || 0) * (item.item_quantity || 0)
            );
          }, 0);
        } else if (a.order_type === "CHECKOUT") {
          const menuItem = a.menu?.[0];
          priceA =
            parseFloat(menuItem?.menu_price || 0) * (a.item_quantity || 1);
        }

        let priceB = 0;
        if (b.order_type === "CART" && b.items) {
          priceB = b.items.reduce((total, item) => {
            const menu = b.menu?.find((m) => m.menu_id === item.menu_id);
            return (
              total +
              parseFloat(menu?.menu_price || 0) * (item.item_quantity || 0)
            );
          }, 0);
        } else if (b.order_type === "CHECKOUT") {
          const menuItem = b.menu?.[0];
          priceB =
            parseFloat(menuItem?.menu_price || 0) * (b.item_quantity || 1);
        }

        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });
    }

    setFilteredOrders(result);
  }, [orders, selectedDate, sortBy, sortOrder]);

  const handleSortChange = (field, direction) => {
    setSortBy(field);
    setSortOrder(direction);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleClearDate = () => {
    setSelectedDate(null);
  };

  const getCategorizedOrders = () => {
    const preparingOrders = filteredOrders.filter(
      (order) =>
        order.status === "Preparing" ||
        order.status === "Confirmed" ||
        order.status === "Accepted"
    );

    const deliveringOrders = filteredOrders.filter(
      (order) =>
        order.status === "Delivering" ||
        order.status === "Out for Delivery" ||
        order.status === "On the Way"
    );

    const completedOrders = filteredOrders.filter(
      (order) =>
        order.status === "Completed" ||
        order.status === "Cancelled" ||
        order.status === "Delivered"
    );

    return { preparingOrders, deliveringOrders, completedOrders };
  };

  const { preparingOrders, deliveringOrders, completedOrders } =
    getCategorizedOrders();

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen bg-yellow-50">
        <Sidebar />
        <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="w-full max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-4 flex items-center">
              <FaHistory className="mr-3" /> Restaurant Orders
            </h2>
            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <FaList className="text-yellow-500 text-xl mr-3" />
                <div>
                  <h3 className="font-medium">Manage Customer Orders</h3>
                  <p className="text-sm text-gray-600">
                    View and process incoming orders for your restaurant
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <LoadingState />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen bg-yellow-50">
        <Sidebar />
        <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="w-full max-w-6xl">
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-4 flex items-center">
              <FaHistory className="mr-3" /> Restaurant Orders
            </h2>
            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <FaList className="text-yellow-500 text-xl mr-3" />
                <div>
                  <h3 className="font-medium">Manage Customer Orders</h3>
                  <p className="text-sm text-gray-600">
                    View and process incoming orders for your restaurant
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow w-full max-w-6xl">
            {!errorCode && (
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
            )}
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen overflow-auto bg-yellow-50">
      <Sidebar />
      <div className="flex flex-col flex-grow w-full overflow-auto md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-600 mb-4 flex items-center">
            <FaHistory className="mr-3" /> Restaurant Orders
          </h2>

          <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FaList className="text-yellow-500 text-xl mr-3" />
              <div>
                <h3 className="font-medium">Manage Customer Orders</h3>
                <p className="text-sm text-gray-600">
                  View and process incoming orders for your restaurant
                </p>
              </div>
            </div>
          </div>

          {orders.length > 0 && (
            <div className="mb-3 flex justify-end items-center space-x-2">
              <DateFilterButton
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                onClearDate={handleClearDate}
              />
              <SortButton
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                options={sortOptions}
              />
            </div>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-lg shadow w-full max-w-6xl">
            <div className="mb-4 flex justify-center">
              <FaShoppingBag className="text-yellow-400 text-5xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {selectedDate
                ? "No Orders Found for Selected Date"
                : "No Orders Found"}
            </h3>
            <p className="text-gray-600">
              {selectedDate
                ? "There are no orders for the selected date. Try selecting a different date."
                : "You don't have any orders yet."}
            </p>
            {selectedDate && (
              <button
                onClick={handleClearDate}
                className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Clear Date Filter
              </button>
            )}
          </div>
        ) : (
          <div className="w-full max-w-6xl space-y-8">
            {preparingOrders.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-blue-600 mb-3 pb-2 border-b border-blue-200">
                  Preparing Orders
                  {selectedDate && (
                    <span className="text-base font-normal text-gray-600 ml-2">
                      ({preparingOrders.length})
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {preparingOrders.map((order) => (
                    <OrderCard key={order.order_id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {deliveringOrders.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-3 pb-2 border-b border-orange-200">
                  Delivering Orders
                  {selectedDate && (
                    <span className="text-base font-normal text-gray-600 ml-2">
                      ({deliveringOrders.length})
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {deliveringOrders.map((order) => (
                    <OrderCard key={order.order_id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {completedOrders.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-green-600 mb-3 pb-2 border-b border-green-200">
                  Completed Orders
                  {selectedDate && (
                    <span className="text-base font-normal text-gray-600 ml-2">
                      ({completedOrders.length})
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {completedOrders.map((order) => (
                    <OrderCard key={order.order_id} order={order} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
