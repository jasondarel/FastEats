/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

const SubmitButton = ({ text, onClickSubmit }) => {
  return (
    <button
      type="submit"
      className="w-full p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition hover:cursor-pointer"
      onClick={onClickSubmit}
    >
      {text}
    </button>
  );
};

export default SubmitButton;
