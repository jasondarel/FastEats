/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { ShoppingCart, CreditCard } from "lucide-react";

const OrderButtons = ({ menu, quantity, addOnTotalPrice = 0, onAddToCart, onOrderNow }) => {
  const basePrice = parseFloat(menu.menu_price) || 0;
  const totalPrice = (basePrice + addOnTotalPrice) * quantity;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <button
        onClick={onAddToCart}
        className="flex-1 bg-white border-2 border-yellow-500 text-yellow-500 px-6 py-3 rounded-lg font-semibold 
          flex items-center justify-center gap-2 hover:bg-yellow-50
          transition-colors duration-200 ease-in-out cursor-pointer"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </button>

      <button
        onClick={onOrderNow}
        className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold 
          flex items-center justify-center gap-2 hover:bg-yellow-600
          transition-colors duration-200 ease-in-out cursor-pointer"
      >
        <CreditCard className="w-5 h-5" />
        Order Now - Rp {totalPrice.toLocaleString()}
      </button>
    </div>
  );
};

export default OrderButtons;
