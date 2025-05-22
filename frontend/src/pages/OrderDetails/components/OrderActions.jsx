const OrderActions = ({
  order,
  paymentLoading,
  onCancel,
  onPayConfirmation,
  onPayment,
  onOrderAgain,
}) => {
  if (!order) return null;

  const totalQuantity = () => {
    let total = 0;
    if (order.order_type === "CHECKOUT") {
      total = order.item_quantity || 0;
    } else {
      if (order && order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item && item.item_quantity) {
            total += item.item_quantity;
          }
        });
      }
    }
    return total;
  };

  const totalPrice = () => {
    let total = 0;
    if (order.order_type === "CHECKOUT") {
      total = order.menu.menu_price * (order.item_quantity || 0);
    } else {
      if (order && order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item && item.menu && item.menu.menu_price && item.item_quantity) {
            const price = item.menu.menu_price * item.item_quantity;
            total += price;
          }
        });
      }
    }
    return total;
  };

  switch (order.status) {
    case "Waiting":
      return (
        <div className="flex justify-between gap-4">
          <button
            className="w-1/2 py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
            onClick={() => onCancel(order.order_id)}
            disabled={paymentLoading}
          >
            Cancel
          </button>
          <button
            className="w-1/2 py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition cursor-pointer"
            onClick={() =>
              onPayConfirmation(order.order_id, totalQuantity(), totalPrice())
            }
          >
            Pay
          </button>
        </div>
      );
    case "Pending":
      return (
        <div className="flex justify-center">
          <button
            className="w-full py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
            onClick={onPayment}
          >
            Pay Order
          </button>
        </div>
      );
    case "Cancelled":
      return (
        <div className="flex justify-center">
          <button
            className="w-full py-2 px-4 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition cursor-pointer"
            onClick={onOrderAgain}
          >
            Order Again
          </button>
        </div>
      );
    case "Preparing":
    case "Delivering":
    case "Completed":
      return null; // No buttons for these statuses
    default:
      return (
        <button
          className={`w-1/2 py-2 px-4 ${
            paymentLoading
              ? "bg-yellow-400 cursor-wait"
              : "bg-yellow-500 hover:bg-yellow-600"
          } text-white font-semibold rounded-lg transition`}
          onClick={() =>
            onPayConfirmation(
              order.order_id,
              order.item_quantity,
              order.menu.menu_price
            )
          }
          disabled={paymentLoading}
        >
          {paymentLoading ? "Memproses..." : "Pay"}
        </button>
      );
  }
};

export default OrderActions;
