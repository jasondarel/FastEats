/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaShoppingBag, FaList } from "react-icons/fa";
import SortButton from "../../components/SortButton";
import FilterButton from "../../components/FilterButton";
import OrderItem from "./components/OrderItem";
import OrderStateMessage from "./components/OrderStateMessage";
import LoadingState from "../../components/LoadingState";
import YellowBackgroundLayout from "./components/Background";
import getAllOrdersWithItems from "../../service/orderServices/ordersService";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeTab, setActiveTab] = useState("All");

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

  const statusTabs = [
    { value: "All", label: "All" },
    { value: "Waiting", label: "Waiting" },
    { value: "Preparing", label: "Preparing" },
    { value: "Delivering", label: "Delivering" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Pending", label: "Pending" },
  ];

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await getAllOrdersWithItems(token);
      console.log("Fetched orders:", response.data);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);

      if (error.response && error.response.status === 404) {
        setOrders([]);
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
  };

  const handleSortChange = (field, direction) => {
    setSortBy(field);
    setSortOrder(direction);
  };

  const getSortedOrders = () => {
    if (!orders || orders.length === 0) return [];

    let filteredOrders = [...orders];

    // Apply status tab filter
    if (activeTab !== "All") {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === activeTab
      );
    }

    // Apply price filter
    if (minPrice || maxPrice) {
      filteredOrders = filteredOrders.filter((order) => {
        const price = parseFloat(order.total_price || 0);
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    if (sortBy === "date") {
      filteredOrders.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === "price") {
      filteredOrders.sort((a, b) => {
        const priceA = parseFloat(a.total_price || 0);
        const priceB = parseFloat(b.total_price || 0);
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });
    }

    return filteredOrders;
  };

  const sortedOrders = getSortedOrders();

  return (
    <YellowBackgroundLayout>
      <div className="w-full max-w-xl p-6 bg-white shadow-xl rounded-xl flex flex-col h-[80vh]">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-yellow-600 mb-3 flex items-center justify-center">
          <FaHistory className="mr-3" /> My Orders
        </h2>

        {/* Status Tabs */}
        <div className="mb-3 border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`hover:cursor-pointer pb-2 px-1 font-medium text-sm transition-all whitespace-nowrap border-b-2 ${
                  activeTab === tab.value
                    ? "text-yellow-600 border-yellow-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && orders.length > 0 && (
          <div className="flex justify-end items-center gap-2">
            <FilterButton
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
            <SortButton
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              options={sortOptions}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 overflow-x-hidden min-h-0">
          {loading && <LoadingState />}

          {error && <OrderStateMessage type="error" subMessage={error} />}

          {!loading && !error && sortedOrders.length === 0 && (
            <OrderStateMessage type="empty" />
          )}

          {!loading &&
            !error &&
            sortedOrders.map((order) => (
              <OrderItem
                key={order.order_id || order.id}
                order={order}
                onOrderClick={() => handleOrderClick(order.order_id)}
                onOrderAgain={handleOrderAgain}
              />
            ))}
        </div>
      </div>
    </YellowBackgroundLayout>
  );
};

export default Orders;
