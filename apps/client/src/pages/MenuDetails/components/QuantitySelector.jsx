/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { MinusCircle, PlusCircle, RotateCcw } from "lucide-react";
import { useState } from "react";

const QuantitySelector = ({ quantity, onQuantityChange, onReset }) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue !== "" && !isNaN(newValue)) {
      const numValue = parseInt(newValue);
      onQuantityChange(numValue - quantity);
    }
  };

  const handleBlur = () => {
    if (inputValue === "" || isNaN(inputValue) || parseInt(inputValue) < 1) {
      setInputValue("1");
      onQuantityChange(1 - quantity);
    } else {
      setInputValue(parseInt(inputValue).toString());
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Quantity
      </label>
      <div className="flex items-center gap-4 bg-gradient-to-r from-amber-50 to-amber-50 px-6 py-3 rounded-xl border-2 border-amber-200 shadow-sm">
        <button
          onClick={() => {
            const newQuantity = Math.max(1, quantity - 1);
            onQuantityChange(newQuantity - quantity);
            setInputValue(newQuantity.toString());
          }}
          className="text-amber-600 hover:text-amber-700 transition-all hover:scale-110 cursor-pointer"
        >
          <MinusCircle className="w-8 h-8" />
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="text-2xl font-bold min-w-[3ch] w-20 text-center bg-white border-2 border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent rounded-lg py-2"
        />

        <button
          onClick={() => {
            const newQuantity = quantity + 1;
            onQuantityChange(1);
            setInputValue(newQuantity.toString());
          }}
          className="text-amber-600 hover:text-amber-700 transition-all hover:scale-110 cursor-pointer"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      </div>

      <button
        onClick={() => {
          onReset();
          setInputValue("1");
        }}
        className="text-gray-500 hover:text-amber-600 transition-colors flex items-center gap-2 text-sm cursor-pointer font-medium"
        title="Reset quantity to 1"
      >
        <RotateCcw className="w-4 h-4" />
        Reset to 1
      </button>
    </div>
  );
};

export default QuantitySelector;
