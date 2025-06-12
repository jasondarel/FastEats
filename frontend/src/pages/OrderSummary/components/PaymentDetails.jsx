/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const PaymentDetails = ({ menuItems, order, transaction, formatCurrency }) => {
  const getItemQuantity = (menuId) => {
    if (order.order_type === "CHECKOUT") {
      return order.item_quantity || 1;
    } else if (order.order_type === "CART") {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        const item = order.orderItems.find((item) => item.menu_id === menuId);
        return item ? item.item_quantity : 1;
      }

      if (order.items && Array.isArray(order.items)) {
        const item = order.items.find((item) => item.menu_id === menuId);
        return item ? item.item_quantity : 1;
      }
    }
    return 1;
  };

  const calculateSubtotal = () => {
    if (
      order.order_type === "CART" &&
      Array.isArray(menuItems) &&
      menuItems.length > 0
    ) {
      return menuItems.reduce((total, item) => {
        const quantity = getItemQuantity(item.menu_id);
        const price = parseFloat(item.menu_price) || 0;
        return total + price * quantity;
      }, 0);
    } else if (
      order.order_type === "CHECKOUT" &&
      order.menu_id &&
      order.item_quantity
    ) {
      if (Array.isArray(order.menu) && order.menu.length > 0) {
        return parseFloat(order.menu[0].menu_price) * order.item_quantity;
      } else if (order.menu && order.menu.menu_price) {
        return parseFloat(order.menu.menu_price) * order.item_quantity;
      }
    }
    return 0;
  };

  const subtotal = calculateSubtotal();
  const totalAmount = subtotal;

  const paymentItems = [
    {
      label: "Subtotal",
      value: formatCurrency(subtotal),
    },
    { label: "Tax", value: formatCurrency(0) },
    { label: "Delivery Fee", value: formatCurrency(0) },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-100 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-amber-900">
        Payment Details
      </h2>

      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <p>Debug: Order Type: {order.order_type}</p>
          <p>Menu Items: {menuItems ? menuItems.length : "null"}</p>
          <p>Order Items: {order.items ? order.items.length : "null"}</p>
          <p>Calculated Subtotal: {subtotal}</p>
        </div>
      )}

      {paymentItems.map((item, index) => (
        <div key={index} className="flex justify-between mb-2">
          <span className="text-amber-700">{item.label}</span>
          <span className="font-semibold text-amber-900">{item.value}</span>
        </div>
      ))}

      <div className="flex justify-between mt-4 pt-4 border-t border-dashed border-amber-300">
        <span className="font-semibold text-lg text-amber-900">Total</span>
        <span className="font-bold text-xl text-amber-900">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {transaction && (
        <div className="mt-4 pt-4 border-t border-dashed border-amber-300 space-y-2">
          <h3 className="font-semibold text-amber-900">Payment Information</h3>
          <div className="flex justify-between">
            <span className="text-amber-700">Payment Type</span>
            <span className="font-semibold text-amber-900">
              {transaction.payment_type.replace("_", " ").toUpperCase()}
            </span>
          </div>
          {transaction.bank && (
            <div className="flex justify-between">
              <span className="text-amber-700">Bank</span>
              <span className="font-semibold text-amber-900">
                {transaction.bank.toUpperCase()}
              </span>
            </div>
          )}
          {transaction.va_number && (
            <div className="flex justify-between">
              <span className="text-amber-700">VA Number</span>
              <span className="font-semibold text-amber-900">
                {transaction.va_number}
              </span>
            </div>
          )}
          {transaction.expiry_time && (
            <div className="flex justify-between">
              <span className="text-amber-700">Expires</span>
              <span className="font-semibold text-amber-900">
                {new Date(transaction.expiry_time).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
