/* eslint-disable react/prop-types */
const OrderSummary = ({
    order
}) => {
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl shadow-sm border border-amber-200">
        <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
        Order Summary
        </h3>
        <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-amber-100 pb-2">
            <span className="text-amber-700 font-medium">Total Items</span>
            <span className="text-amber-900 font-semibold">
            {order.item_quantity}
            </span>
        </div>
        <div className="flex justify-between items-center border-b border-amber-100 pb-2">
            <span className="text-amber-700 font-medium">Subtotal</span>
            <span className="text-amber-900 font-semibold">
            Rp{" "}
            {order.order_type === "CHECKOUT"
              ? (
                (parseFloat(order.menu_price) * order.item_quantity).toLocaleString("id-ID")
              )
             : (
                order.items.reduce(
                  (sum, item) =>
                    sum + parseFloat(item.menu_price) * item.item_quantity,
                  0
                ).toLocaleString("id-ID")
             )}
            </span>
        </div>
        <div className="flex justify-between items-center border-b border-amber-100 pb-2">
            <span className="text-amber-700 font-medium">Tax</span>
            <span className="text-amber-900 font-semibold">
            Rp {(2000).toLocaleString("id-ID")}
            </span>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-amber-300">
            <span className="text-lg font-bold text-amber-800">Total</span>
            <span className="text-lg font-bold text-amber-900">
            Rp{" "}
            {order.order_type === "CHECKOUT"
              ? (
                  (parseFloat(order.menu_price) * order.item_quantity + 2000
                  ).toLocaleString("id-ID")
                )
              : (
                  order.items.reduce(
                    (sum, item) =>
                      sum + parseFloat(item.menu_price) * item.item_quantity,
                    0
                  ) + 2000
                ).toLocaleString("id-ID")}
            </span>
        </div>
        </div>
    </div>
  )
}

export default OrderSummary