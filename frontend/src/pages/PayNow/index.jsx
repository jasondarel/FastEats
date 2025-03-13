import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PaymentButton from "./components/PaymentButton";
import PaymentLayout from "./components/PaymentLayout";
import { API_URL } from "../../config/api";

const PayNow = () => {
  const [snapToken, setSnapToken] = useState(null);
  const orderId = useParams().orderId;

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
    console.log("orderId:", orderId);
    const fetchSnapToken = async () => {
      try {
        const response = await fetch(
          `${API_URL}/order/snap/${orderId}`
        );
        const data = await response.json();
        setSnapToken(data.snap_token);
        console.log(data);
      } catch (error) {
        console.error("Error fetching snap token:", error);
      }
    };

    if (orderId) {
      fetchSnapToken();
    }
  }, [orderId]);

  const handlePay = () => {
    if (window.snap && snapToken) {
      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          console.log("Payment success:", result);
        },
        onPending: (result) => {
          console.log("Payment pending:", result);
        },
        onError: (error) => {
          console.error("Payment error:", error);
        },
        onClose: () => {
          console.log("Payment popup closed");
        },
      });
    } else {
      console.error("Snap.js belum dimuat atau token tidak tersedia");
    }
  };

  return (
    <PaymentLayout>
      <PaymentButton onPay={handlePay} snapToken={snapToken} />
    </PaymentLayout>
  );
};

export default PayNow;
