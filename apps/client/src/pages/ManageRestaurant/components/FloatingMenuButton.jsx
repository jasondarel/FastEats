/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { FaUtensils } from "react-icons/fa";

const FloatingMenuButton = () => {
  return (
    <a
      href="../my-menu"
      className="fixed bottom-10 right-10 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:bg-yellow-600 transition flex items-center"
    >
      <FaUtensils className="mr-2" /> My Menu
    </a>
  );
};

export default FloatingMenuButton;
