import React from "react";

const AuthLayout = ({ children, isSellerRegister }) => {
  const themes = {
    customer: {
      bgGradient:
        "bg-gradient-to-r from-transparent via-blue-500/5 to-transparent",
      panelGradient: "bg-gradient-to-br from-white via-white to-blue-50",
      overlayGradient:
        "bg-gradient-to-br from-blue-400 via-transparent to-blue-600",
      radialGradient:
        "bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_70%)]",

      logoGradient: "from-blue-400 to-blue-500",

      animatedCircles: [
        "bg-gradient-to-br from-blue-200 to-blue-300",
        "bg-gradient-to-br from-sky-200 to-sky-300",
        "bg-gradient-to-br from-cyan-200 to-cyan-300",
        "bg-gradient-to-br from-blue-300 to-sky-400",
      ],

      formBg: "from-blue-50 to-sky-50",
    },
    seller: {
      bgGradient:
        "bg-gradient-to-r from-transparent via-purple-500/5 to-transparent",
      panelGradient: "bg-gradient-to-br from-white via-white to-purple-50",
      overlayGradient:
        "bg-gradient-to-br from-purple-400 via-transparent to-purple-600",
      radialGradient:
        "bg-[radial-gradient(circle_at_30%_40%,rgba(147,51,234,0.1),transparent_70%)]",

      logoGradient: "from-purple-400 to-purple-500",

      animatedCircles: [
        "bg-gradient-to-br from-purple-200 to-purple-300",
        "bg-gradient-to-br from-violet-200 to-violet-300",
        "bg-gradient-to-br from-indigo-200 to-indigo-300",
        "bg-gradient-to-br from-purple-300 to-violet-400",
      ],

      formBg: "from-purple-50 to-violet-50",
    },
  };

  const currentTheme = isSellerRegister ? themes.seller : themes.customer;

  return (
    <div className="min-h-screen w-full lg:w-1/2 overflow-y-auto relative">
      <div
        className="fixed inset-0 w-full h-full"
      >
        <div className="absolute inset-0"></div>
        <div
          className={`absolute inset-0  animate-pulse`}
        ></div>
      </div>

      <div className="relative z-10 flex items-center justify-start w-full h-full">
        <div
          className={`w-full h-full min-h-screen p-4 sm:p-8 ${currentTheme.panelGradient} shadow-2xl overflow-y-auto flex flex-col justify-center relative backdrop-blur-sm border-r border-gray-100`}
        >
          <div className="absolute inset-0 opacity-5">
            <div
              className={`absolute inset-0 ${currentTheme.overlayGradient}`}
            ></div>
            <div
              className={`absolute top-0 left-0 w-full h-full ${currentTheme.radialGradient}`}
            ></div>
          </div>

          <div className="absolute left-6 top-6">
            <img
              src="/logo_FastEats.png"
              alt="Logo"
              className="w-23 mx-auto drop-shadow-lg"
            />
          </div>

          <div
            className={`absolute top-10 right-10 w-24 h-24 ${currentTheme.animatedCircles[0]} rounded-full opacity-15 animate-bounce`}
            style={{ animationDuration: "3s" }}
          ></div>
          <div
            className={`absolute bottom-32 left-8 w-20 h-20 ${currentTheme.animatedCircles[1]} rounded-full opacity-10 animate-pulse`}
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className={`absolute top-1/4 right-16 w-16 h-16 ${currentTheme.animatedCircles[2]} rounded-full opacity-12 animate-pulse`}
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className={`absolute bottom-1/4 left-20 w-14 h-14 ${currentTheme.animatedCircles[3]} rounded-full opacity-8 animate-bounce`}
            style={{ animationDelay: "2s", animationDuration: "4s" }}
          ></div>

          <div
            className="flex flex-col items-center justify-center w-full "
          >
            <div className="w-[90%] sm:w-[80%] md:w-[50%] lg:w-[90%] xl:w-[70%]">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentTheme.formBg} rounded-3xl opacity-50 blur-sm`}
              ></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;