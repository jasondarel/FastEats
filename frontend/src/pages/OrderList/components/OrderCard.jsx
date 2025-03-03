// src/components/Orders/OrderCard.jsx
import React from "react";
import { ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  // Format date function embedded in the component
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format price function embedded in the component
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex-col border-yellow-300 bg-white shadow-xl rounded-xl px-6 py-4 cursor-pointer mb-4 lg:w-[48%] hover:shadow-2xl transition-all duration-300 hover:bg-yellow-50 hover:border-yellow-400"
    onClick={() => navigate(`/order-summary/${order.order_id}`)}>
      <div className="flex justify-between gap-8 lg:gap-4">
        <div>
          <h2 className="text-2xl font-bold text-yellow-600">
            {order.user?.name || "Customer"}
          </h2>
          <p className="text-slate-700 bg-yellow-100 px-2 py-1 rounded-md text-sm inline-block mt-1">
            {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex font-semibold text-yellow-700 items-center bg-yellow-100 px-3 rounded-full">
          {order.item_quantity || 1} menu{" "}
          <ChevronRightIcon className="ml-1 text-yellow-500" />
        </div>
      </div>
      <div className="h-0.5 bg-yellow-200 mt-5 mb-3 rounded-full"></div>
      <div className="flex justify-between text-slate-800 bg-yellow-100 p-3 rounded-lg">
        <p className="py-1 text-2xl font-bold text-yellow-800">Total Price </p>
        <p className="py-1 text-2xl font-bold text-yellow-800">
          {formatPrice(order.calculatedTotalPrice || 0)}
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
