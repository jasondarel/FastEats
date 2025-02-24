import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const OrderDeliveringPage = () => {
  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6">
        <div className="text-center">
          {/* Container for Lottie animation */}
          <div className="relative w-84 h-84 mx-auto mb-6">
            {/* Lottie Animation */}
            <DotLottieReact
              src="https://lottie.host/1227bbdc-43c4-4906-bf08-6d27acf0d697/DOrQKgF1UY.lottie"
              loop
              autoplay
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Your Order is on the Way
          </h1>

          <p className="text-gray-600 mb-4">
            Our delivery partner is bringing your delicious meal straight to
            your doorstep!
          </p>

          <div className="text-sm text-yellow-600 mb-4">
            Estimated delivery time: 15-20 minutes
          </div>

          {/* Progress Bar */}
          <div className="flex mb-6 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className="w-1/3 bg-yellow-400" />
            <div className="w-[2px] bg-white" />
            <div className="w-1/3 bg-yellow-400" />
            <div className="w-[2px] bg-white" />
            <div className="w-1/3 bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDeliveringPage;
