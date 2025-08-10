/* eslint-disable react/prop-types */
import { ChevronRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaShoppingBag } from "react-icons/fa";
import StatusBadge from "../../../components/StatusBadge";

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const jakartaDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);

    return jakartaDate.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  let itemCount = 0;
  let totalPrice = 0;

  itemCount = order.items.reduce(
      (total, item) => total + (item.item_quantity || 0),
      0
    );

  totalPrice = order.items.reduce((total, item) => {
    const menuPrice = parseFloat(item.menu_price || 0);
    const quantity = item.item_quantity || 0;
    return total + menuPrice * quantity;
  }, 0);

  const status = order.status || "Pending";
  const isCompleted = status === "Completed" || status === "Cancelled";

  const handleCardClick = () => {
    navigate(`/order-summary/${order.order_id}`);
  };

  return (
    <div
      className="flex flex-col bg-white shadow-md hover:shadow-xl rounded-lg border-l-4 transition-all duration-300 cursor-pointer"
      style={{ borderLeftColor: isCompleted ? "#9CA3AF" : "#FBBF24" }}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
            <FaShoppingBag className="text-yellow-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">
              {order.user?.name || "Customer"}
            </h4>
            <p className="text-sm text-gray-500">
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge
            status={status}
            className="px-3 py-1 rounded-full text-xs font-medium"
          />
        </div>
      </div>

      <div className="p-4 flex">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            </div>
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs text-gray-500 uppercase">Total Price</h3>
              <p className="text-lg font-bold text-yellow-600">
                {formatPrice(totalPrice)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
