import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = ({
  to = -1,
  className = "",
  position = "absolute top-4 left-4 lg:left-76",
  iconSize = "w-6 h-6",
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (typeof to === "string") {
      navigate(to);
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className={`flex items-center justify-center top-8 right-8 w-12 h-12 bg-white text-yellow-500 text-2xl rounded-full focus:outline-none hover:bg-yellow-500 hover:text-white hover:cursor-pointer transition ${position} ${className}`}
      aria-label="Go back"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 19.5 8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  );
};

export default BackButton;
