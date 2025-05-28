/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
const OrderInfo = ({ orderDetails, formatDate }) => {
  const { order, user, transaction } = orderDetails;

  const infoItems = [
    { label: "Order Date", value: formatDate(order.created_at) },
    { label: "Customer", value: `${user.name} (${user.email})` },
    {
      label: "Payment Method",
      value: transaction?.payment_type?.toUpperCase() || "QRIS",
    },
    {
      label: "Payment Expires",
      value: formatDate(transaction?.expiry_time),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {infoItems.map((item, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg shadow-sm border border-amber-100"
        >
          <div className="text-sm text-amber-700 mb-1">{item.label}</div>
          <div className="font-semibold text-lg text-amber-900">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderInfo;
