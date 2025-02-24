import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const OrderPreparingPage = () => {
  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-xl p-6">
        <div className="text-center">
          {/* Container for Lottie animation */}
          <div className="relative w-84 h-84 mx-auto mb-6">
            {/* Lottie Animation */}
            <DotLottieReact
              className="absolute inset-0 w-full h-full"
              src="https://lottie.host/e113de9a-3d49-4136-bc9c-0703a1041edd/eT7Kkp0txx.lottie"
              loop
              autoplay
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Preparing Your Order
          </h1>

          <p className="text-gray-600 mb-4">
            Our chefs are working their magic! Your delicious meal will be ready
            soon.
          </p>

          <div className="text-sm text-yellow-600">
            Estimated preparation time: 20-25 minutes
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPreparingPage;
