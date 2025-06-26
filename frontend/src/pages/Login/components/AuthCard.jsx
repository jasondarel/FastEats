/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const AuthCard = ({ children, logoSrc, title }) => {
  return (
    <div className="relative z-10 flex items-center justify-start w-full h-full">
      <div className="w-1/2 h-full min-h-screen p-8 bg-white shadow-lg overflow-y-auto flex flex-col justify-center">
        <div className="mx-40">
          <img src={logoSrc} alt="Logo" className="w-32 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-center mb-6">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
