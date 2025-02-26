import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Thanks = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const statusCode = searchParams.get("status_code");
  const transactionStatus = searchParams.get("transaction_status");

  const [message, setMessage] = useState("");
  const [showPayNow, setShowPayNow] = useState(false);

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
      return;
    }

    switch (transactionStatus) {
      case "settlement":
        setMessage(`🎉 Your Order Progress is successful!`);
        setShowPayNow(false);
        break;
      case "pending":
        setMessage(`⚠️ Your Order Progress is pending. Please complete it.`);
        setShowPayNow(true);
        break;
      case "deny":
      case "cancel":
      case "expire":
        setMessage(`❌ Your Order Progress was ${transactionStatus}.`);
        setShowPayNow(false);
        break;
      default:
        setMessage("❓ Unknown transaction status. Please contact support.");
        setShowPayNow(false);
    }
  }, [orderId, statusCode, transactionStatus]);

  const handlePayNow = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`http://localhost:5000/order/snap/${orderId}`);
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
      className="flex w-screen min-h-screen items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/delivery.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col bg-yellow-400 p-10 justify-center items-center gap-4">
          <h2 className="text-2xl font-bold text-center text-yellow-900">{message}</h2>
          
          {/* Button Section */}
          <div className="w-full flex flex-col gap-3">
            <a
              href={`/order/${orderId}`}
              className="bg-gray-800 text-white p-3 rounded-xl w-full flex justify-center hover:bg-gray-900 transition duration-300"
            >
              Back
            </a>

            {showPayNow && (
              <button
                onClick={handlePayNow}
                className="bg-emerald-600 text-white p-3 rounded-xl w-full flex justify-center items-center hover:bg-emerald-700 transition duration-300 transform hover:scale-105 shadow-md"
              >
                💳 Pay Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
