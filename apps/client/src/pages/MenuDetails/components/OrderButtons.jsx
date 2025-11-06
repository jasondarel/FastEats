/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { ShoppingCart, CreditCard } from "lucide-react";

const OrderButtons = ({
  menu,
  quantity,
  addOnTotalPrice = 0,
  onAddToCart,
  onOrderNow,
}) => {
  const basePrice = parseFloat(menu.menu_price) || 0;
  const totalPrice = (basePrice + addOnTotalPrice) * quantity;

  return (
    <div className="space-y-4">
      {/* Total Price Display */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Total Amount:</span>
          <span className="text-2xl md:text-3xl font-bold bg-amber-600 bg-clip-text text-transparent">
            Rp {totalPrice.toLocaleString("id-ID")}
          </span>
        </div>
        {addOnTotalPrice > 0 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            Includes add-ons: Rp{" "}
            {(addOnTotalPrice * quantity).toLocaleString("id-ID")}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onAddToCart}
          className="flex-1 bg-white border-2 border-amber-500 text-amber-600 px-6 py-4 rounded-xl font-bold text-lg
            flex items-center justify-center gap-3 hover:bg-amber-50 hover:border-amber-600
            transition-all duration-300 ease-in-out cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <ShoppingCart className="w-6 h-6" />
          Add to Cart
        </button>

        <button
          onClick={onOrderNow}
          className="flex-1 bg-amber-500 text-white px-6 py-4 rounded-xl font-bold text-lg
            flex items-center justify-center gap-3 hover:from-amber-600 hover:to-yellow-500
            transition-all duration-300 ease-in-out cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <CreditCard className="w-6 h-6" />
          Order Now
        </button>
      </div>
    </div>
  );
};

export default OrderButtons;
