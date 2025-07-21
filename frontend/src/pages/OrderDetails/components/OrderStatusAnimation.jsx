/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const OrderStatusAnimation = ({ status }) => {
  const getLottieAnimation = (status) => {
    switch (status) {
      case "Preparing":
        return "https://lottie.host/e113de9a-3d49-4136-bc9c-0703a1041edd/eT7Kkp0txx.lottie";
      case "Delivering":
        return "https://lottie.host/1227bbdc-43c4-4906-bf08-6d27acf0d697/DOrQKgF1UY.lottie";
      case "Completed":
        return "https://lottie.host/dd23579f-26b5-4b04-8fe3-edc841827620/Qh3EsqxT3g.lottie";
      case "Waiting":
        return "https://lottie.host/e32b2761-4d9d-4f63-95ab-899051f6b8da/jeAjS2g6jh.lottie";
      case "Cancelled":
        return "https://lottie.host/1a20f4b7-ffd5-47c2-9ff0-f8abfbd91352/QaXJ8BkEZQ.lottie";
      case "Pending":
        return "https://lottie.host/e32b2761-4d9d-4f63-95ab-899051f6b8da/jeAjS2g6jh.lottie";
      default:
        return null;
    }
  };

  // Function to get status message
  const getStatusMessage = (status) => {
    switch (status) {
      case "Preparing":
        return "Our chefs are preparing your delicious meal!";
      case "Delivering":
        return "Your order is on the way to your location!";
      case "Completed":
        return "Your order has been delivered successfully!";
      case "Waiting":
        return "Please select a payment method to proceed.";
      case "Pending":
        return "Please complete your payment to proceed.";
      case "Cancelled":
        return "Your order has been cancelled.";
      default:
        return "";
    }
  };

  const lottieUrl = getLottieAnimation(status);
  const statusMessage = getStatusMessage(status);

  // Set speed to 0.5 (half speed) for Cancelled status, 1 for others
  const animationSpeed = status === "Cancelled" ? 0.5 : 1;

  if (!lottieUrl) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="relative w-64 h-64 mx-auto">
        <DotLottieReact src={lottieUrl} loop autoplay speed={animationSpeed} />
      </div>
      {statusMessage && (
        <p className="text-amber-700 text-center">{statusMessage}</p>
      )}
    </div>
  );
};

export default OrderStatusAnimation;
