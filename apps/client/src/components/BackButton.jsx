import React from "react";
import { useNavigate } from "react-router-dom";
import { GoChevronLeft } from "react-icons/go";

const BackButton = ({
  to = -1,
  className = "",
  position = "absolute top-4 left-4 lg:left-76",
  iconSize = "w-6 h-6",
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(to);
  };

  return (
    <button
      onClick={handleGoBack}
      className={`hover:cursor-pointer flex items-center justify-center top-8 right-8 w-12 h-12 bg-white text-yellow-500 text-2xl rounded-full focus:outline-none hover:bg-yellow-500 hover:text-white hover:cursor-pointer transition ${position} ${className}`}
      aria-label="Go back"
    >
      <GoChevronLeft />
    </button>
  );
};

export default BackButton;
