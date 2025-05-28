/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const FormInput = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  type = "text",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-3 border rounded-lg focus:outline-none focus:border-0 focus:ring-2 focus:ring-yellow-500"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
