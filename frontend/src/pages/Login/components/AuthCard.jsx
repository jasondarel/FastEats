import React from "react";

const AuthCard = ({ children, logoSrc, title }) => {
  return (
    <div className="relative z-10 flex items-center justify-center w-full h-full">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <img src={logoSrc} alt="Logo" className="w-32 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-center mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;