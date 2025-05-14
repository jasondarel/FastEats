import React from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag, FaSync } from "react-icons/fa";
import StatusBadge from "../../../components/StatusBadge";
import image from "../../../assets/orderHistory-dummy.jpg";
import { API_URL } from "../../../config/api";

const OrderItem = ({ order, onOrderClick, onOrderAgain }) => {
  const navigate = useNavigate();

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

  const showOrderAgainButton =
    order.status === "Completed" || order.status === "Cancelled";

  const totalItems = order.items?.reduce(
    (sum, item) => sum + (item.item_quantity || 0),
    0
  );

  return (
    <div
      className="my-3 px-4 py-4 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onOrderClick(order.order_id)}
    >
      {/* Header */}
      <div className="flex justify-between gap-x-2">
        <div className="flex">
          <div className="flex items-center mr-3">
            <FaShoppingBag className="text-yellow-600 text-lg" />
          </div>
          <div>
            <h4 className="font-bold leading-3 text-sm">Order</h4>
            <p className="text-sm text-slate-700">
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <StatusBadge
            status={order.status}
            className="px-2 py-1 rounded-md font-semibold text-sm"
          />
        </div>
      </div>

      <hr className="my-3 border-gray-300" />

      {/* Items preview (show up to 2 items) */}
      <div className="space-y-2">
        {order.items?.slice(0, 2).map((item, idx) => (
          <div className="flex" key={item.order_item_id || idx}>
            <img
              src={image}
              alt="product"
              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200"
            />
            <div className="pt-2 pl-4 flex-1 min-w-0">
              <h2 className="font-bold truncate text-base md:text-lg">
                Menu #{item.menu_id}
              </h2>
              <p className="text-slate-600">{item.item_quantity} Item</p>
            </div>
          </div>
        ))}
        {order.items?.length > 2 && (
          <p className="text-sm text-gray-500">
            +{order.items.length - 2} more item(s)
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-3">
        <div className="flex flex-col">
          <h2 className="text-sm text-gray-600">Total Items</h2>
          <p className="font-bold text-yellow-600">{totalItems} Item(s)</p>
        </div>
        {showOrderAgainButton && (
          <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOrderAgain(order); // Pass entire order to handler
                navigate(`/menu`); // Or navigate to a custom reorder page
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
