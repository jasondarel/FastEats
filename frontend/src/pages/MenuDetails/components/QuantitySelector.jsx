import { MinusCircle, PlusCircle, RotateCcw } from "lucide-react";
import { useState } from "react";

const QuantitySelector = ({ quantity, onQuantityChange, onReset }) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Only update the actual quantity if the value is a valid number
    if (newValue !== "" && !isNaN(newValue)) {
      const numValue = parseInt(newValue);
      onQuantityChange(numValue - quantity);
    }
  };

  const handleBlur = () => {
    // When the input loses focus, ensure we have a valid value
    if (inputValue === "" || isNaN(inputValue) || parseInt(inputValue) < 1) {
      setInputValue("1");
      onQuantityChange(1 - quantity);
    } else {
      setInputValue(parseInt(inputValue).toString());
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg">
        <button
          onClick={() => {
            const newQuantity = Math.max(1, quantity - 1);
            onQuantityChange(newQuantity - quantity);
            setInputValue(newQuantity.toString());
          }}
          className="text-yellow-600 hover:text-yellow-700 transition-colors cursor-pointer"
        >
          <MinusCircle className="w-6 h-6" />
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="text-xl font-semibold min-w-[3ch] w-16 text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded"
        />

        <button
          onClick={() => {
            const newQuantity = quantity + 1;
            onQuantityChange(1);
            setInputValue(newQuantity.toString());
          }}
          className="text-yellow-600 hover:text-yellow-700 transition-colors cursor-pointer"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      </div>

      <button
        onClick={() => {
          onReset();
          setInputValue("1");
        }}
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
