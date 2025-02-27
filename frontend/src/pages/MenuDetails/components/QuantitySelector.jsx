import { MinusCircle, PlusCircle, RotateCcw } from "lucide-react";

const QuantitySelector = ({ quantity, onQuantityChange, onReset }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg">
        <button
          onClick={() => onQuantityChange(-1)}
          className="text-yellow-600 hover:text-yellow-700 transition-colors cursor-pointer"
        >
          <MinusCircle className="w-6 h-6" />
        </button>

        <input
          type="number"
          value={quantity}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 1;
            onQuantityChange(value - quantity);
          }}
          onBlur={(e) => {
            const value = parseInt(e.target.value) || 1;
            if (value < 1) onQuantityChange(1 - quantity);
          }}
          className="text-xl font-semibold min-w-[3ch] w-16 text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="1"
        />

        <button
          onClick={() => onQuantityChange(1)}
          className="text-yellow-600 hover:text-yellow-700 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      </div>

      <button
        onClick={onReset}
        className="text-gray-500 hover:text-yellow-600 transition-colors flex items-center gap-2 text-sm cursor-pointer"
        title="Reset quantity to 1"
      >
        <RotateCcw className="w-4 h-4" />
        Reset quantity
      </button>
    </div>
  );
};

export default QuantitySelector;
