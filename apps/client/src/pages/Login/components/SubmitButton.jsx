/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const SubmitButton = ({ text }) => {
  return (
    <button
      type="submit"
      className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
    >
      {text}
    </button>
  );
};

export default SubmitButton;
