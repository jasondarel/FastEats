/* eslint-disable react/prop-types */
const OrderSummary = ({ order }) => {
  const calculateAddOnPrice = (addOns) => {
    if (!addOns || !Array.isArray(addOns)) return 0;

    let total = 0;
    addOns.forEach((category) => {
      if (category.items && Array.isArray(category.items)) {
        category.items.forEach((item) => {
          if (item.adds_on_price && parseFloat(item.adds_on_price) > 0) {
            total += parseFloat(item.adds_on_price) * (item.quantity || 1);
          }
        });
      }
    });
    return total;
  };

  const calculateCartAddOnPrice = (items, orderAddOns) => {
    if (
      !items ||
      !Array.isArray(items) ||
      !orderAddOns ||
      !Array.isArray(orderAddOns)
    )
      return 0;

    let total = 0;
    items.forEach((item) => {
      const itemAddOns = orderAddOns.filter(
        (addon) => addon.order_item_id === (item.id || item.order_item_id)
      );

      total += calculateAddOnPrice(itemAddOns);
    });
    return total;
  };

  const getOrderTotals = () => {
    console.log("🔎 getOrderTotals Debug - Full Order Object:", order);
    console.log("🔎 Order Type:", order.order_type);
    console.log("🔎 Order AddOns:", order.addsOn);
    console.log("🔎 Order Items:", order.items);

    if (order.order_type === "CHECKOUT") {
      const menuTotal = parseFloat(order.menu_price) * order.item_quantity;
      const addOnTotal = calculateAddOnPrice(order.addsOn);
      return {
        menuTotal,
        addOnTotal,
        subtotal: menuTotal + addOnTotal,
      };
    } else {
      const menuTotal = order.items.reduce(
        (sum, item) => sum + parseFloat(item.menu_price) * item.item_quantity,
        0
      );
      const addOnTotal = calculateCartAddOnPrice(order.items, order.addsOn);
      return {
        menuTotal,
        addOnTotal,
        subtotal: menuTotal + addOnTotal,
      };
    }
  };

  const { menuTotal, addOnTotal, subtotal } = getOrderTotals();
  const tax = 2000;
  const total = subtotal + tax;

  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl shadow-sm border border-amber-200">
      <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
        Order Summary
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-amber-100 pb-2">
          <span className="text-amber-700 font-medium">Total Items</span>
          <span className="text-amber-900 font-semibold">
            {order.order_type === "CHECKOUT"
              ? order.item_quantity
              : order.items.reduce((sum, item) => sum + item.item_quantity, 0)}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-amber-100 pb-2">
          <span className="text-amber-700 font-medium">Menu Subtotal</span>
          <span className="text-amber-900 font-semibold">
            Rp {menuTotal.toLocaleString("id-ID")}
          </span>
        </div>

        {addOnTotal > 0 && (
          <div className="flex justify-between items-center border-b border-amber-100 pb-2">
            <span className="text-amber-700 font-medium">Add-ons Total</span>
            <span className="text-amber-900 font-semibold">
              Rp {addOnTotal.toLocaleString("id-ID")}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center border-b border-amber-100 pb-2">
          <span className="text-amber-700 font-medium">Subtotal</span>
          <span className="text-amber-900 font-semibold">
            Rp {subtotal.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-amber-100 pb-2">
          <span className="text-amber-700 font-medium">Tax</span>
          <span className="text-amber-900 font-semibold">
            Rp {tax.toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-amber-300">
          <span className="text-lg font-bold text-amber-800">Total</span>
          <span className="text-lg font-bold text-amber-900">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
