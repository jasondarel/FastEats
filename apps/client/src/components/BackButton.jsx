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
      className={`hover:cursor-pointer flex items-center justify-center z-100 top-8 right-8 w-12 h-12  bg-white text-yellow-500 text-2xl rounded-full border  shadow-[0_6px_16px_rgba(156,163,175,0.35)] hover:bg-yellow-500 hover:text-white transition ${position} ${className}`}
      aria-label="Go back"
    >
      <GoChevronLeft />
    </button>
  );
};

export default BackButton;

