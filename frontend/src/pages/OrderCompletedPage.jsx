import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const OrderCompletedPage = () => {
  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6">
        <div className="text-center">
          {/* Container for Lottie animation */}
          <div className="relative w-84 h-84 mx-auto mb-6">
            {/* Lottie Animation */}
            <DotLottieReact
              src="https://lottie.host/dd23579f-26b5-4b04-8fe3-edc841827620/Qh3EsqxT3g.lottie"
              loop
              autoplay
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Order Completed!
          </h1>

          <p className="text-gray-600 mb-4">
            Your order has been delivered successfully. Enjoy your meal!
          </p>

          <div className="text-sm text-yellow-600 mb-4">
            Thank you for choosing our service
          </div>

          {/* Progress Bar */}
          <div className="flex mb-6 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className="w-1/3 bg-yellow-400" />
            <div className="w-[2px] bg-white" />
            <div className="w-1/3 bg-yellow-400" />
            <div className="w-[2px] bg-white" />
            <div className="w-1/3 bg-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCompletedPage;
