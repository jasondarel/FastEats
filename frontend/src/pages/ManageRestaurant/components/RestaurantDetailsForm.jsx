import React, { useState, useEffect } from "react";
import {
  FaUtensils,
  FaMapMarkerAlt,
  FaSave,
  FaExclamationCircle,
} from "react-icons/fa";

const RestaurantDetailsForm = ({
  restaurantName,
  setRestaurantName,
  restaurantAddress,
  setRestaurantAddress,
  bcaAccount,
  setBcaAccount,
  gopay,
  setGopay,
  dana,
  setDana,
  isChanged,
  onSubmit,
}) => {
  const [errors, setErrors] = useState({
    bcaAccount: "",
    gopay: "",
    dana: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form fields
  useEffect(() => {
    let newErrors = {
      bcaAccount: "",
      gopay: "",
      dana: "",
    };

    setErrors(newErrors);

    // Check if form is valid and changes were made
    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    setIsFormValid(isChanged && !hasErrors);
  }, [bcaAccount, gopay, dana, isChanged]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Restaurant Name
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
          <FaUtensils className="ml-3 text-gray-500" />
          <input
            type="text"
            placeholder="Enter your restaurant name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            required
            className="w-full p-3 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Restaurant Address
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
          <FaMapMarkerAlt className="ml-3 text-gray-500" />
          <input
            type="text"
            placeholder="Enter your restaurant address"
            value={restaurantAddress}
            onChange={(e) => setRestaurantAddress(e.target.value)}
            required
            className="w-full p-3 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        className={`w-full p-3 text-white text-lg font-semibold rounded-lg transition flex items-center justify-center ${
          isFormValid
            ? "bg-yellow-500 hover:bg-yellow-600 hover:cursor-pointer"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        <FaSave className="mr-2" /> Update Restaurant
      </button>
    </form>
  );
};

export default RestaurantDetailsForm;
