/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { CheckIcon } from "lucide-react";

const OrderStatus = ({ currentStep }) => {
  const steps = ["Waiting", "Pending", "Preparing", "Delivering", "Completed"];

  return (
    <div className="flex justify-between mb-8 relative before:content-[''] before:absolute before:top-4 before:left-0 before:right-0 before:h-[2px] before:bg-gray-300">
      {steps.map((step, index) => {
        const stepIndex = steps.indexOf(currentStep);
        const isActive = step === currentStep;
        const isCompleted = index < stepIndex;

        return (
          <div key={index} className="flex flex-col items-center relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                isActive
                  ? "bg-amber-600 text-white"
                  : isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-gray-300 text-gray-600"
              }`}
            >
              {step === "Waiting" ? (
                "📦"
              ) : step === "Pending" ? (
                "⌛"
              ) : step === "Preparing" ? (
                "🍳"
              ) : step === "Delivering" ? (
                "🛵"
              ) : (
                <CheckIcon />
              )}
            </div>
            <div
              className={`text-sm font-semibold ${
                isActive
                  ? "text-amber-600"
                  : isCompleted
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            >
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatus;
