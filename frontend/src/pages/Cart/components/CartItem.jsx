import React from "react";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";

const CartItem = ({ item, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div className="my-3 px-4 py-4 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow">
      <div className="flex">
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200"
        />
        <div className="pt-2 pl-4 flex-1 min-w-0">
          <h2 className="font-bold truncate overflow-hidden text-ellipsis whitespace-nowrap text-base md:text-lg">
            {item.name}
          </h2>
          <p className="text-slate-600">{item.size}</p>
        </div>
      </div>

      <div className="flex justify-between mt-3">
        <div className="flex flex-col">
          <h2 className="text-sm text-gray-600">Price</h2>
          <p className="font-bold text-yellow-600">
            Rp {item.price.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="bg-gray-200 hover:bg-gray-300 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            disabled={item.quantity <= 1}
          >
            <FaMinus className="text-gray-700 text-xs" />
          </button>

          <span className="font-semibold w-8 text-center">{item.quantity}</span>

          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="bg-gray-200 hover:bg-gray-300 h-8 w-8 rounded-full flex items-center justify-center transition-colors"
          >
            <FaPlus className="text-gray-700 text-xs" />
          </button>

          <button
            onClick={() => onRemoveItem(item.id)}
            className="ml-2 text-red-500 hover:text-red-700 transition-colors"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <div className="text-right">
          <h2 className="text-sm text-gray-600">Subtotal</h2>
          <p className="font-bold">
            Rp {(item.price * item.quantity).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
