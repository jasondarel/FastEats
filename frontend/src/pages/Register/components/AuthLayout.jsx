import React from "react";

const AuthLayout = ({ children, isSellerRegister }) => {
  return (
    <div className="min-h-screen w-full overflow-y-auto bg-gray-900 relative">
      <div
        className="fixed inset-0 w-full h-full bg-gray-900 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/foodbg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gray-900/75"></div>
      </div>

      <div className="relative z-10 flex items-center justify-start w-full h-full">
        <div className="w-1/2 h-full min-h-screen p-6 sm:p-8 bg-white shadow-lg overflow-y-auto flex flex-col justify-center">
          <div className={`${isSellerRegister ? "mx-20" : "mx-40"}`}>
            <img
              src="/logo_FastEats.png"
              alt="Logo"
              className="w-32 mx-auto mb-4"
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
