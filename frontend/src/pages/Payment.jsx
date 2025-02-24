import React, { useState } from "react";

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const paymentMethods = [
    {
      id: "ovo",
      name: "OVO",
      description: "Pay with your OVO balance",
      icon: "/ovo.png",
    },
    {
      id: "gopay",
      name: "GoPay",
      description: "Pay with your GoPay balance",
      icon: "/gopay.png",
    },
    {
      id: "qris",
      name: "QRIS",
      description: "Scan QRIS code to pay",
      icon: "qris.png",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMethod) return;

    if (
      (selectedMethod === "ovo" || selectedMethod === "gopay") &&
      !phoneNumber.match(/^(\+62|62|0)[0-9]{9,11}$/)
    ) {
      alert("Please enter a valid Indonesian phone number");
      return;
    }

    console.log("Processing payment:", { method: selectedMethod, phoneNumber });
  };

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
        <div className="bg-yellow-400 p-6">
          <h2 className="text-2xl font-bold text-center text-yellow-900">
            Select Payment Method
          </h2>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Order Amount Display */}
            <div className="text-center mb-8">
              <p className="text-gray-500">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">Rp 150.000</p>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`relative flex items-center space-x-4 rounded-xl border-2 p-6 cursor-pointer transition-all duration-200
                    ${
                      selectedMethod === method.id
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50"
                    }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-5 h-5 text-yellow-600 border-gray-300 focus:ring-yellow-500"
                  />
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Icon/Logo */}
                    {method.icon.endsWith(".png") ? (
                      <img
                        src={method.icon}
                        alt={method.name}
                        className={`w-8 h-8 object-contain ${
                          method.id === "gopay" ? "w-6 h-6" : "" // Smaller size for GoPay logo
                        }`}
                      />
                    ) : (
                      <span className="text-3xl">{method.icon}</span>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {method.name}
                      </p>
                      <p className="text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phone Number Input */}
            {(selectedMethod === "ovo" || selectedMethod === "gopay") && (
              <div className="space-y-3 bg-gray-50 p-6 rounded-xl">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value="+62"
                    disabled
                    className="w-16 px-3 py-3 border rounded-lg bg-gray-100 text-gray-500"
                  />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="812XXXXXXX"
                    className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Enter the phone number linked to your{" "}
                  {selectedMethod.toUpperCase()} account
                </p>
              </div>
            )}

            {/* QRIS Placeholder */}
            {selectedMethod === "qris" && (
              <div className="text-center p-12 border-2 border-dashed rounded-xl border-yellow-300 bg-yellow-50">
                <p className="text-gray-600">
                  QRIS code will be generated here after confirming order
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedMethod}
              className={`w-full py-4 px-6 rounded-xl text-white font-medium text-lg transition-all duration-200
                ${
                  selectedMethod
                    ? "bg-yellow-500 hover:bg-yellow-600 transform hover:-translate-y-0.5"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {selectedMethod === "qris"
                ? "Generate QRIS Code"
                : "Continue to Payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
