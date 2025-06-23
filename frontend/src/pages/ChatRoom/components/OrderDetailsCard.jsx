import {
  FaReceipt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
} from "react-icons/fa";

const OrderDetailsCard = ({
  orderDetails,
  formatPrice,
  isInMessage = false,
}) => {
  if (!orderDetails) return null;

  const cardClasses = isInMessage
    ? "bg-white border border-gray-200 rounded-lg p-4 max-w-sm"
    : "bg-white border border-gray-200 rounded-lg p-4 shadow-sm";

  const firstItem = orderDetails.items?.[0];

  return (
    <div className={cardClasses}>
      <div className="flex items-center mb-3">
        {firstItem?.image && (
          <img
            src={firstItem.image}
            alt={firstItem.name}
            className="w-12 h-12 object-cover rounded mr-3"
            onError={(e) => (e.target.style.display = "none")}
          />
        )}
        <div>
          <h4 className="font-semibold text-gray-800 text-sm">
            Order #{orderDetails.orderId || "N/A"}
          </h4>
          <p className="text-sm text-gray-600">
            {orderDetails.items
              ? orderDetails.items
                  .slice(0, 3)
                  .map((item) => `${item.name} x${item.quantity}`)
                  .join(", ")
              : "No items"}
          </p>
        </div>
      </div>

      <div className="text-right">
        <span className="text-sm text-gray-500">Total:</span>
        <p className="font-semibold text-gray-800">
          {formatPrice(orderDetails.totalPrice)}
        </p>
      </div>
    </div>
  );
};

export default OrderDetailsCard;
