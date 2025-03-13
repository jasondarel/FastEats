import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaSync } from "react-icons/fa";
import StatusBadge from "../../../components/StatusBadge";
import image from "../../../assets/orderHistory-dummy.jpg";
import { API_URL } from "../../../config/api";

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
          <StatusBadge
            status={order.status || "Completed"}
            className="px-2 py-1 rounded-md font-semibold text-sm"
          />
        </div>
      </div>
      <hr className="my-3 border-gray-300" />
      <div className="flex">
        <img
          src={
            order.menu?.menu_image
              ? `${API_URL}/restaurant/uploads/menu/${order.menu.menu_image}`
              : image
          }
          alt="product"
          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200"
        />
        <div className="pt-2 pl-4 flex-1 min-w-0">
          <h2 className="font-bold truncate overflow-hidden text-ellipsis whitespace-nowrap text-base md:text-lg">
            {order.menu?.menu_name || "Minuman Yang Sangat Mantap banget"}
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
              className="bg-yellow-500 hover:bg-yellow-600 px-4 py-1.5 rounded-lg text-white font-semibold text-sm transition-colors flex items-center cursor-pointer"
            >
              <FaSync className="mr-2" /> Order again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItem;
