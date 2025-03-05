import React from "react";

const AuthLayout = ({ children, isSellerRegister }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-8 px-4 bg-gray-100 relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-gray-900 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/foodbg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gray-900/75"></div>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full">
        <div
          className={`w-full ${
            isSellerRegister ? "max-w-4xl" : "max-w-md"
          } mx-auto p-6 sm:p-8 bg-white shadow-lg rounded-lg`}
        >
          <img
            src="/logo_FastEats.png"
            alt="Logo"
            className="w-32 mx-auto mb-4"
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
