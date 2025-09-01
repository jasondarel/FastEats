import {
  FaReceipt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaShoppingBag,
  FaCheckCircle,
  FaEye,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OrderDetailsCard = ({
  orderDetails,
  formatPrice,
  isInMessage = false,
  currentUserRole = null,
}) => {
  const navigate = useNavigate();

  if (!orderDetails) return null;

  const cardClasses = isInMessage
    ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 max-w-sm shadow-lg"
    : "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 shadow-lg";

  const firstItem = orderDetails.items?.[0];
  const totalItems =
    orderDetails.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) ||
    0;

  const getOrderId = () => {
    const original = orderDetails.originalOrderDetails || orderDetails;
    return (
      original.orderId ||
      original._id ||
      original.id ||
      original.orderNumber ||
      "N/A"
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "text-green-600 bg-green-100";
      case "preparing":
      case "in-progress":
        return "text-amber-600 bg-amber-100";
      case "pending":
        return "text-orange-600 bg-orange-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-amber-600 bg-amber-100";
    }
  };

  const handleViewOrder = () => {
    const orderId = getOrderId();
    if (orderId && orderId !== "N/A") {
      navigate(`/order-summary/${orderId}`);
    }
  };

  const isSeller =
    currentUserRole === "seller" || currentUserRole === "restaurant";

  console.log("OrderDetailsCard received orderDetails:", orderDetails);

  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-amber-100 p-2 rounded-lg mr-3">
            <FaReceipt className="text-amber-600 text-lg" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-base">
              Order #{getOrderId()}
            </h4>
            {orderDetails.status && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                  orderDetails.status
                )}`}
              >
                {orderDetails.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {(orderDetails.deliveryTime ||
        orderDetails.customerName ||
        orderDetails.deliveryAddress) && (
        <div className="mb-4 space-y-2">
          {orderDetails.deliveryTime && (
            <div className="flex items-center text-sm">
              <FaClock className="text-amber-600 text-xs mr-2" />
              <span className="text-gray-600">
                Delivery:{" "}
                {new Date(orderDetails.deliveryTime).toLocaleTimeString(
                  "id-ID",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>
            </div>
          )}

          {orderDetails.customerName && (
            <div className="flex items-center text-sm">
              <FaUser className="text-amber-600 text-xs mr-2" />
              <span className="text-gray-600">{orderDetails.customerName}</span>
            </div>
          )}

          {orderDetails.deliveryAddress && (
            <div className="flex items-start text-sm">
              <FaMapMarkerAlt className="text-amber-600 text-xs mr-2 mt-0.5" />
              <span className="text-gray-600 text-xs leading-relaxed">
                {orderDetails.deliveryAddress}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-amber-200 pt-3">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-600">
            Total Amount:
          </span>
          <div className="text-right">
            <p className="font-bold text-lg text-amber-700">
              {formatPrice(orderDetails.totalPrice)}
            </p>
          </div>
        </div>

        {isSeller && (
          <div className="flex justify-center">
            <button
              onClick={handleViewOrder}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FaEye size={14} />
              <span>View Order</span>
            </button>
          </div>
        )}
      </div>

      {orderDetails.status?.toLowerCase() === "completed" ||
        (orderDetails.status?.toLowerCase() === "delivered" && (
          <div className="mt-3 flex items-center justify-center">
            <FaCheckCircle className="text-green-500 text-sm mr-2" />
            <span className="text-sm text-green-600 font-medium">
              Order Completed
            </span>
          </div>
        ))}
    </div>
  );
};

export default OrderDetailsCard;
