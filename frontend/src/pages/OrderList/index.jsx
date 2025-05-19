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
      const response = await fetch(`${API_URL}/order/orders-by-restaurant`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Fetched orders:", data);

      if (data.success) {
        setOrders(data.orders);
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
    return (
      <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen bg-yellow-50">
        <Sidebar />
        <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8">
          <OrderListHeader />
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen overflow-hidden bg-yellow-50">
      <Sidebar />
      <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8">
        <OrderListHeader />

        {error && !loading && <ErrorState message={error} />}

        {!loading && !error && orders.length === 0 && (
          <EmptyState message="No orders found" />
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row lg:flex-wrap lg:justify-between gap-4 mt-6">
            {orders.map((order) => (
              <OrderCard key={order.order_id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
