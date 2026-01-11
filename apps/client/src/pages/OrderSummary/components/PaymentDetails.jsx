/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

const PaymentDetails = ({ menuItems, order, transaction, formatCurrency }) => {
  // Calculate total addon price from all items
  const calculateTotalAddonPrice = () => {
    if (!menuItems || !Array.isArray(menuItems)) return 0;
    
    let total = 0;
    menuItems.forEach(item => {
      if (item.addons && Array.isArray(item.addons)) {
        item.addons.forEach(category => {
          if (category.addons && Array.isArray(category.addons)) {
            category.addons.forEach(addon => {
              total += addon.total_price || 0;
            });
          }
        });
      }
    });
    return total;
  };

  // Calculate subtotal (menu items only, without addons)
  const calculateMenuSubtotal = () => {
    if (!menuItems || !Array.isArray(menuItems)) return 0;
    
    return menuItems.reduce((total, item) => {
      const menuPrice = parseFloat(item.menu_price || 0);
      const quantity = item.item_quantity || 1;
      return total + (menuPrice * quantity);
    }, 0);
  };

  const totalAddonPrice = calculateTotalAddonPrice();
  const menuSubtotal = calculateMenuSubtotal();
  const deliveryFee = 0;

  const paymentItems = [
    {
      label: "Subtotal (Menu Items)",
      value: formatCurrency(menuSubtotal),
    },
  ];

  // Only show toppings line if there are toppings
  if (totalAddonPrice > 0) {
    paymentItems.push({
      label: "Toppings/Add-ons",
      value: formatCurrency(totalAddonPrice),
    });
  }

  paymentItems.push({
    label: "Delivery Fee",
    value: formatCurrency(deliveryFee),
  });

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
          {formatCurrency(menuSubtotal + totalAddonPrice + deliveryFee)}
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
         
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;
