import React, { useState, useEffect } from "react";
import {
  FaUtensils,
  FaMapMarkerAlt,
  FaSave,
  FaMoneyBillAlt,
  FaWallet,
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

    // BCA Account validation (10 digits)
    if (bcaAccount && !/^\d{10}$/.test(bcaAccount)) {
      newErrors.bcaAccount = "BCA account must be exactly 10 digits";
    }

    if (gopay && !/^\d{10,13}$/.test(gopay)) {
      newErrors.gopay = "GoPay number must be between 10 and 13 digits";
    }
    
    // DANA validation (10-13 digits)
    if (dana && !/^\d{10,13}$/.test(dana)) {
      newErrors.dana = "DANA number must be between 10 and 13 digits";
    }

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

      <div>
        <label className="block text-gray-700 font-medium mb-1">
          BCA Account
        </label>
        <div
          className={`flex items-center border ${
            errors.bcaAccount ? "border-red-500" : "border-gray-300"
          } rounded-lg shadow-sm focus-within:ring-2 ${
            errors.bcaAccount
              ? "focus-within:ring-red-500"
              : "focus-within:ring-yellow-500"
          }`}
        >
          <FaMoneyBillAlt
            className={`ml-3 ${
              errors.bcaAccount ? "text-red-500" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="Enter your BCA account number (10 digits)"
            value={bcaAccount}
            onChange={(e) => {
              // Only allow numeric input
              const value = e.target.value.replace(/[^\d]/g, "");
              setBcaAccount(value);
            }}
            required
            maxLength={10}
            className="w-full p-3 focus:outline-none"
          />
          {errors.bcaAccount && (
            <FaExclamationCircle className="mr-3 text-red-500" />
          )}
        </div>
        {errors.bcaAccount && (
          <p className="mt-1 text-red-500 text-sm">{errors.bcaAccount}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">GoPay</label>
        <div
          className={`flex items-center border ${
            errors.gopay ? "border-red-500" : "border-gray-300"
          } rounded-lg shadow-sm focus-within:ring-2 ${
            errors.gopay
              ? "focus-within:ring-red-500"
              : "focus-within:ring-yellow-500"
          }`}
        >
          <FaWallet
            className={`ml-3 ${
              errors.gopay ? "text-red-500" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="Enter your GoPay number (10-13 digits)"
            value={gopay}
            onChange={(e) => {
              // Only allow numeric input
              const value = e.target.value.replace(/[^\d]/g, "");
              setGopay(value);
            }}
            required
            maxLength={12}
            className="w-full p-3 focus:outline-none"
          />
          {errors.gopay && (
            <FaExclamationCircle className="mr-3 text-red-500" />
          )}
        </div>
        {errors.gopay && (
          <p className="mt-1 text-red-500 text-sm">{errors.gopay}</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">DANA</label>
        <div
          className={`flex items-center border ${
            errors.dana ? "border-red-500" : "border-gray-300"
          } rounded-lg shadow-sm focus-within:ring-2 ${
            errors.dana
              ? "focus-within:ring-red-500"
              : "focus-within:ring-yellow-500"
          }`}
        >
          <FaWallet
            className={`ml-3 ${errors.dana ? "text-red-500" : "text-gray-500"}`}
          />
          <input
            type="text"
            placeholder="Enter your DANA number (10-13 digits)"
            value={dana}
            onChange={(e) => {
              // Only allow numeric input
              const value = e.target.value.replace(/[^\d]/g, "");
              setDana(value);
            }}
            required
            maxLength={12}
            className="w-full p-3 focus:outline-none"
          />
          {errors.dana && <FaExclamationCircle className="mr-3 text-red-500" />}
        </div>
        {errors.dana && (
          <p className="mt-1 text-red-500 text-sm">{errors.dana}</p>
        )}
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
