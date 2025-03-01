import React from "react";

const ErrorMessage = ({ error, center = false }) => {
  if (!error) return null;

  return (
    <p className={`text-red-500 text-sm mt-1 ${center ? "text-center" : ""}`}>
      {error}
    </p>
  );
};

export default ErrorMessage;
