const PaymentDetails = ({ menu, order, transaction, formatCurrency }) => {
  const paymentItems = [
    {
      label: "Subtotal",
      value: formatCurrency(parseFloat(menu.menu_price) * order.item_quantity),
    },
    { label: "Tax", value: formatCurrency(0) },
    { label: "Delivery Fee", value: formatCurrency(0) },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-100 mb-8">
      <h2 className="text-lg font-semibold mb-4 text-amber-900">
        Payment Details
      </h2>
      {paymentItems.map((item, index) => (
        <div key={index} className="flex justify-between mb-2">
          <span className="text-amber-700">{item.label}</span>
          <span className="font-semibold text-amber-900">{item.value}</span>
        </div>
      ))}
      <div className="flex justify-between mt-4 pt-4 border-t border-dashed border-amber-300">
        <span className="font-semibold text-lg text-amber-900">Total</span>
        <span className="font-bold text-xl text-amber-900">
          {transaction
            ? formatCurrency(transaction.amount)
            : formatCurrency(parseFloat(menu.menu_price) * order.item_quantity)}
        </span>
      </div>
    </div>
  );
};

export default PaymentDetails;
