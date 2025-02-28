import React from "react";

const InputField = ({ icon, type, name, placeholder, value, onChange }) => {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-yellow-500">
      {icon}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full p-3 focus:outline-none"
      />
    </div>
  );
};

export default InputField;
