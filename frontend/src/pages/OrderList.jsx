import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { ChevronRightIcon } from "lucide-react";

const OrderList = () => {
  const token = localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/order/orders-by-restaurant", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Process orders to calculate total price for each order
        const processedOrders = data.orders.map(order => {
          // Calculate total price from menu price and item quantity
          const menuPrice = parseFloat(order.menu?.menu_price || 0);
          const quantity = order.item_quantity || 1;
          const calculatedTotalPrice = menuPrice * quantity;
          
          return {
            ...order,
            calculatedTotalPrice
          };
        });
        
        setOrders(processedOrders);
      } else {
        setError(data.message || "Failed to fetch orders");
      }
    } catch(err) {
      console.error("Error fetching orders:", err);
      setError("An error occurred while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-10 w-full md:pl-64 h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-grow items-center w-full overflow-auto md:px-6 lg:px-8">
        <div className="w-full max-w-6xl sticky top-0 py-4 z-5 bg-white">
          <h2 className="text-4xl font-extrabold text-center text-yellow-600">
            Order List
          </h2>
          <hr className="border-t-2 border-gray-400 w-full max-w-6xl mt-4" />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center w-full h-32">
            <p className="text-xl text-gray-600">Loading orders...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex justify-center items-center w-full h-32">
            <p className="text-xl text-red-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex justify-center items-center w-full h-32">
            <p className="text-xl text-gray-600">No orders found</p>
          </div>
        )}

        {/* Order cards container - with padding to create space from sidebar */}
        {!loading && !error && orders.length > 0 && (
          <div className="w-full max-w-6xl flex flex-col lg:flex-row lg:flex-wrap lg:justify-between">
            {orders.map((order) => {
              // Create a reliable unique key using order_id
              const orderKey = order.order_id || `order-${Math.random().toString(36).substr(2, 9)}`;
              
              return (
                <div
                  key={orderKey}
                  className="flex-col border border-slate-300 shadow-xl rounded-xl px-3 py-2 cursor-pointer mb-4 lg:w-[48%] hover:shadow-2xl transition-shadow"
                >
                  <div className="flex justify-between gap-8 lg:gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-yellow-500">
                        {order.user?.name || "Customer"}
                      </h2>
                      <p className="text-slate-700">({formatDate(order.created_at)})</p>
                    </div>
                    <div className="flex font-semibold text-slate-700">
                      {order.item_quantity || 1} menu <ChevronRightIcon className="pt-0.5" />
                    </div>
                  </div>
                  <hr className="mt-5"></hr>
                  <div className="flex justify-between text-slate-800">
                    <p className="py-3 text-2xl font-bold">Total Price </p>
                    <p className="py-3 text-2xl font-bold">
                      {formatPrice(order.calculatedTotalPrice || 0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;