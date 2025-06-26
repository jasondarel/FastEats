import React from "react";

const AuthCard = ({ children, logoSrc, title }) => {
  return (
    <div className="relative z-10 flex items-center justify-start w-full h-full">
      <div className="w-1/2 h-full min-h-screen p-8 bg-gradient-to-br from-white via-white to-gray-50 shadow-2xl overflow-y-auto flex flex-col justify-center relative backdrop-blur-sm border-r border-gray-100">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-transparent to-yellow-600"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]"></div>
        </div>

        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full opacity-15 animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-20 w-12 h-12 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="mx-40 relative z-10">
          <div className="text-center mb-8 transform hover:scale-105 transition-transform duration-300">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
                <img
                  src={logoSrc}
                  alt="Logo"
                  className="w-32 mx-auto drop-shadow-lg"
                />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent relative">
            {title}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"></div>
          </h2>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-3xl opacity-50 blur-sm"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
