import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Thanks = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const statusCode = searchParams.get("status_code");
  const transactionStatus = searchParams.get("transaction_status");

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!orderId || !statusCode || !transactionStatus) {
      setMessage("Invalid transaction details. Please check your order.");
      return;
    }

    switch (transactionStatus) {
      case "settlement":
        setMessage(`Your payment for Order #${orderId} is successful! 🎉`);
        break;
      case "pending":
        setMessage(`Your payment for Order #${orderId} is pending. Please complete it.`);
        break;
      case "deny":
        setMessage(`Your payment for Order #${orderId} was denied.`);
        break;
      case "cancel":
        setMessage(`Your payment for Order #${orderId} was canceled.`);
        break;
      case "expire":
        setMessage(`Your payment for Order #${orderId} has expired.`);
        break;
      default:
        setMessage("Unknown transaction status. Please contact support.");
    }
  }, [orderId, statusCode, transactionStatus]);

  return (
    <div
      className="flex w-screen min-h-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/delivery.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Centered Card */}
      <div className="m-auto w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col bg-yellow-400 p-10 justify-center items-center gap-3">
          <h2 className="text-2xl font-bold text-center text-yellow-900">{message}</h2>
          <a
            href="/home"
            className="bg-emerald-600 text-white p-3 rounded-xl w-full flex justify-center"
          >
            Back
          </a>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
