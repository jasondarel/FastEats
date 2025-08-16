/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const FormInput = ({ type, placeholder, value, onChange, error }) => {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full p-3 border rounded-lg focus:border-0 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
