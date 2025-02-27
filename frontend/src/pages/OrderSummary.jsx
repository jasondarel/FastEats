import React, { useState, useEffect } from "react";
import { CheckIcon } from "lucide-react";
import { useParams } from "react-router-dom";

const OrderDetails = () => {
  const [order, setOrder] = useState(null);

  const { order_id } = useParams();

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/order/restaurant-order/${order_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Replace with your token
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch order summary.");
        }

        const data = await response.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error("Error fetching order summary:", error);
        throw error;
      }
    };

    fetchOrderSummary();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <header className="flex justify-between items-center pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-2xl font-semibold ">Order Details</h1>
          <p>Order #{order.order_id}</p>
        </div>
        <div className="inline-block bg-yellow-400 text-gray-800 px-4 py-2 rounded-full font-semibold text-sm">
          Pending
        </div>
      </header>

      <div className="flex justify-between mb-8 relative before:content-[''] before:absolute before:top-4 before:left-0 before:right-0 before:h-[2px] before:bg-gray-300">
        {["Order Placed", "Payment Pending", "Preparing", "Completed"].map(
          (step, index) => (
            <div
              key={index}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  index === 0
                    ? "bg-amber-600 text-white"
                    : index === 1
                    ? "bg-yellow-400 text-white"
                    : index === 2
                    ? "bg-blue-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {index === 0 ? (
                  "📦"
                ) : index === 1 ? (
                  "⌛"
                ) : index === 2 ? (
                  "🚚"
                ) : (
                  <CheckIcon />
                )}
              </div>
              <div
                className={`text-sm font-semibold ${
                  index === 0
                    ? "text-amber-600"
                    : index === 1
                    ? "text-yellow-400"
                    : index === 2
                    ? "text-blue-500"
                    : "text-green-500"
                }`}
              >
                {step}
              </div>
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Order Date", value: "26 Feb 2025, 01:35" },
          { label: "Customer", value: "admin (admin@gmail.com)" },
          { label: "Payment Method", value: "QRIS" },
          { label: "Payment Expires", value: "26 Feb 2025, 08:51" },
        ].map((item, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">{item.label}</div>
            <div className="font-semibold text-lg">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg mb-4">
          <img
            src="/api/placeholder/80/80"
            alt="Sate Ayam"
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="text-lg font-semibold">Sate Ayam</div>
            <div className="text-sm text-gray-600 mb-2">
              Sate Ayam khas Lamongan
            </div>
            <div className="text-blue-900 font-semibold">IDR 90,000.00</div>
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-lg font-semibold">
            x2
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        {[
          { label: "Subtotal", value: "IDR 180,000.00" },
          { label: "Tax", value: "IDR 0.00" },
          { label: "Delivery Fee", value: "IDR 0.00" },
        ].map((item, index) => (
          <div key={index} className="flex justify-between mb-2">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
        <div className="flex justify-between mt-4 pt-4 border-t border-dashed border-gray-300">
          <span className="font-semibold text-lg">Total</span>
          <span className="font-bold text-xl text-blue-900">
            IDR 180,000.00
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {" "}
        <button className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:opacity-90">
          Complete Payment
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
