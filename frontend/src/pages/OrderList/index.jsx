// src/pages/Orders/OrderList.jsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import OrderCard from "./components/OrderCard";
import OrderListHeader from "./components/OrderListHeader";
import LoadingState from "../../components/LoadingState";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import { API_URL } from "../../config/api";

const OrderList = () => {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/order/orders-by-restaurant` ,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Process orders to calculate total price for each order
        const processedOrders = data.orders.map((order) => {
          // Calculate total price from menu price and item quantity
          const menuPrice = parseFloat(order.menu?.menu_price || 0);
          const quantity = order.item_quantity || 1;
          const calculatedTotalPrice = menuPrice * quantity;

          return {
            ...order,
            calculatedTotalPrice,
          };
        });

        setOrders(processedOrders);
      } else {
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
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen overflow-hidden bg-yellow-50">
      <Sidebar />
      <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8">
        <OrderListHeader />

        {/* Error state */}
        {error && !loading && <ErrorState message={error} />}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <EmptyState message="No orders found" />
        )}

        {/* Order cards container */}
        {!loading && !error && orders.length > 0 && (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row lg:flex-wrap lg:justify-between gap-4 mt-6">
            {orders.map((order) => {
              // Create a reliable unique key using order_id
              const orderKey =
                order.order_id ||
                `order-${Math.random().toString(36).substr(2, 9)}`;

              return <OrderCard key={orderKey} order={order} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
