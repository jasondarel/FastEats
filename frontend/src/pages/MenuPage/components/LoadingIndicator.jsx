// components/LoadingIndicator.jsx
import React from "react";

const LoadingIndicator = ({ message = "Loading..." }) => {
  return <div className="text-center p-5">{message}</div>;
};

export default LoadingIndicator;
