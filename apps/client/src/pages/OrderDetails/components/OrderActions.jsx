/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
const OrderActions = ({
  order,
  paymentLoading,
  isShippingValid = true,
  onCancel,
  onPayConfirmation,
  onPayment,
  onOrderAgain,
}) => {
  console.log("OrderActions Rendered", order);
  if (!order) return null;

  const calculateAddOnPrice = (addOns) => {
    if (!addOns || !Array.isArray(addOns)) return 0;
    
    let total = 0;
    addOns.forEach(category => {
      if (category.items && Array.isArray(category.items)) {
        category.items.forEach(item => {
          if (item.adds_on_price && parseFloat(item.adds_on_price) > 0) {
            total += parseFloat(item.adds_on_price) * (item.quantity || 1);
          }
        });
      }
    });
    console.log("Add-On Price:", total);
    return total;
  };

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
      const menuPrice = order.menu_price * (order.item_quantity || 0);
      const addOnPrice = calculateAddOnPrice(order.addsOn);
      total = menuPrice + addOnPrice;
    } else {
      const addOnPrice = calculateAddOnPrice(order.addsOn);
      if (order && order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item && item.menu_price && item.item_quantity) {
            const price = item.menu_price * item.item_quantity;
            total += price;
          }
        });
      }
      total += addOnPrice || 0;
    }
    return total;
  };

  const isPayDisabled = paymentLoading || !isShippingValid;

  switch (order.status) {
    case "Waiting":
      return (
        <div className="space-y-4">
          <div className="flex justify-between gap-4">
            <button
              className="w-1/2 py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
              onClick={() => onCancel(order.order_id)}
              disabled={paymentLoading}
            >
              Cancel
            </button>
            <button
              className={`w-1/2 py-2 px-4 font-semibold rounded-lg transition ${
                isPayDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 text-white hover:bg-yellow-600 cursor-pointer"
              }`}
              onClick={() =>
                onPayConfirmation(order.order_id, totalQuantity(), totalPrice())
              }
              disabled={isPayDisabled}
              title={
                !isShippingValid ? "Please complete shipping information" : ""
              }
            >
              {paymentLoading ? "Processing..." : "Pay"}
            </button>
          </div>
        </div>
      );
    case "Pending":
      return (
        <div className="space-y-4">
          {!isShippingValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">
                Please complete all shipping information before proceeding with
                payment.
              </p>
            </div>
          )}
          <div className="flex justify-center">
            <button
              className={`w-full py-2 px-4 font-semibold rounded-lg transition ${
                isPayDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
              onClick={onPayment}
              disabled={isPayDisabled}
              title={
                !isShippingValid ? "Please complete shipping information" : ""
              }
            >
              {paymentLoading ? "Processing..." : "Pay Order"}
            </button>
          </div>
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
      return null;
    default:
      return (
        <div className="space-y-4">
          {!isShippingValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">
                Please complete all shipping information before proceeding with
                payment.
              </p>
            </div>
          )}
          <button
            className={`w-1/2 py-2 px-4 font-semibold rounded-lg transition ${
              isPayDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-500 text-white hover:bg-yellow-600"
            }`}
            onClick={() =>
              onPayConfirmation(
                order.order_id,
                totalQuantity(),
                totalPrice()
              )
            }
            disabled={isPayDisabled}
            title={
              !isShippingValid ? "Please complete shipping information" : ""
            }
          >
            {paymentLoading ? "Processing..." : "Pay"}
          </button>
        </div>
      );
  }
};

export default OrderActions;