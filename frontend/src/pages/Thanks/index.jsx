/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaQuestionCircle,
  FaArrowLeft,
  FaCreditCard,
} from "react-icons/fa";
import { API_URL } from "../../config/api";

const Thanks = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const statusCode = searchParams.get("status_code");
  const transactionStatus = searchParams.get("transaction_status");

  const [message, setMessage] = useState("");
  const [showPayNow, setShowPayNow] = useState(false);
  const [statusIcon, setStatusIcon] = useState(null);
  const [statusColor, setStatusColor] = useState("yellow-500");

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!orderId || !statusCode || !transactionStatus) {
      setMessage("Invalid transaction details. Please check your order.");
      setStatusIcon(<FaQuestionCircle className="text-4xl text-gray-500" />);
      setStatusColor("gray-500");
      return;
    }

    switch (transactionStatus) {
      case "settlement":
        setMessage("Your order has been successfully processed!");
        setStatusIcon(<FaCheckCircle className="text-4xl text-green-500" />);
        setStatusColor("green-500");
        setShowPayNow(false);
        break;
      case "pending":
        setMessage("Your order is pending. Please complete your payment.");
        setStatusIcon(
          <FaExclamationTriangle className="text-4xl text-yellow-500" />
        );
        setStatusColor("yellow-500");
        setShowPayNow(true);
        break;
      case "deny":
        setMessage(
          "Your payment was denied. Please try a different payment method."
        );
        setStatusIcon(<FaTimesCircle className="text-4xl text-red-500" />);
        setStatusColor("red-500");
        setShowPayNow(false);
        break;
      case "cancel":
        setMessage("Your order was cancelled.");
        setStatusIcon(<FaTimesCircle className="text-4xl text-red-500" />);
        setStatusColor("red-500");
        setShowPayNow(false);
        break;
      case "expire":
        setMessage("Your payment session has expired.");
        setStatusIcon(<FaTimesCircle className="text-4xl text-red-500" />);
        setStatusColor("red-500");
        setShowPayNow(false);
        break;
      default:
        setMessage("Unknown transaction status. Please contact support.");
        setStatusIcon(<FaQuestionCircle className="text-4xl text-gray-500" />);
        setStatusColor("gray-500");
        setShowPayNow(false);
    }
  }, [orderId, statusCode, transactionStatus]);

  const handlePayNow = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(
        `${API_URL}/order/snap/${orderId}`
      );
      const data = await response.json();

      if (data?.snap_token) {
        window.snap.pay(data.snap_token);
      } else {
        alert("Failed to get transaction token.");
      }
    } catch (error) {
      console.error("Error fetching transaction token:", error);
      alert("Error processing payment.");
    }
  };

  return (
    <div
      className="flex w-screen min-h-screen bg-yellow-100"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/delivery.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <main className="flex-1 flex justify-center items-center p-5">
        <div className="w-full max-w-xl bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Status Icon */}
          <div
            className={`bg-${statusColor} bg-opacity-20 p-8 flex flex-col items-center justify-center`}
          >
            <div
              className={`w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg mb-4`}
            >
              {statusIcon}
            </div>
            <h2
              className={`text-3xl font-bold text-center text-${statusColor} mb-2`}
            >
              {transactionStatus === "settlement"
                ? "Thank You!"
                : "Order Status"}
            </h2>
            <div className={`text-lg text-center text-gray-700 max-w-md`}>
              {message}
            </div>
            {orderId && (
              <div className="mt-3 px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-500">
                  Order ID:{" "}
                </span>
                <span className="text-sm font-bold text-gray-700">
                  {orderId}
                </span>
              </div>
            )}
          </div>

          {/* Button Section */}
          <div className="p-8 space-y-4">
            <a
              href={`/order/${orderId}`}
              className="w-full p-3 bg-gray-800 text-white text-lg font-semibold rounded-lg transition flex items-center justify-center hover:bg-gray-900 shadow-md"
            >
              <FaArrowLeft className="mr-2" /> View Order Details
            </a>

            {showPayNow && (
              <button
                onClick={handlePayNow}
                className="w-full p-3 bg-yellow-500 text-white text-lg font-semibold rounded-lg transition flex items-center justify-center hover:bg-yellow-600 shadow-md transform hover:scale-105"
              >
                <FaCreditCard className="mr-2" /> Complete Payment
              </button>
            )}
          </div>

          <div className="pb-6 px-8">
            <a
              href="/"
              className="block w-full text-center text-yellow-600 hover:text-yellow-700 hover:underline font-medium"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Thanks;
