import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { FaShieldAlt, FaArrowLeft, FaRedo } from "react-icons/fa";

const OtpVerifPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const email = searchParams.get("email") || "your email";
  const phone = searchParams.get("phone") || "your phone";

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token");

  const checkToken = async () => {
    if (!token) {
      setError("Invalid token");
      navigate("/register");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/user/verify-token`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Token expired or invalid");
      }

      const data = await response.json();
      console.log("Token is valid:", data);
    } catch (err) {
      setError(err.message || "Failed to verify token");
      navigate("/register");
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
    console.log("Token:", token);
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    // Update the OTP state
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto focus next input after entry
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key for OTP fields
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input when backspace is pressed on empty field
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle OTP verification
  const verifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    console.log("OTP Verified:", otpValue);
    try {
      const response = await fetch(`http://localhost:5000/user/verify-otp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: otpValue }),
      });
      const data = await response.json();
      localStorage.removeItem("token");
      alert(data.message);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    }
    setError("");
  };

  const resendOtp = async () => {
    if (timer > 0) return;

    setIsResending(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset timer and OTP fields
      setTimer(60);
      setOtp(new Array(6).fill(""));
      inputRefs.current[0].focus();
      setError("");
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Format phone number (you can customize this)
  const formatRecipient = () => {
    if (email && email.includes("@")) {
      return email.replace(/(.{2})(.*)(?=@)/, "$1***");
    }
    if (phone) {
      return phone.replace(/(\d{2})(\d+)(\d{2})/, "$1****$3");
    }
    return "your contact";
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
          {/* OTP Header Section */}
          <div className="bg-yellow-500 bg-opacity-20 p-8 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg mb-4">
              <FaShieldAlt className="text-4xl text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold text-center text-yellow-500 mb-2">
              Verification Code
            </h2>
            <div className="text-lg text-center text-gray-700 max-w-md">
              Enter the 6-digit code sent to {formatRecipient()}
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

          {/* OTP Input Section */}
          <div className="p-8 space-y-6">
            <div className="flex justify-center space-x-3">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-200 focus:outline-none transition"
                />
              ))}
            </div>

            {error && (
              <div className="text-red-500 text-center font-medium">
                {error}
              </div>
            )}

            <button
              onClick={verifyOtp}
              className="w-full p-3 bg-yellow-500 text-white text-lg font-semibold rounded-lg transition flex items-center justify-center hover:bg-yellow-600 shadow-md"
            >
              Verify Code
            </button>

            <div className="flex flex-col items-center space-y-2">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?{" "}
                {timer > 0 ? (
                  <span>Resend in {timer}s</span>
                ) : (
                  <button
                    onClick={resendOtp}
                    disabled={isResending}
                    className="text-yellow-600 font-medium hover:underline focus:outline-none disabled:opacity-50 flex items-center"
                  >
                    <FaRedo className="mr-1" size={12} />
                    {isResending ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </p>
            </div>
          </div>

          <div className="pb-6 px-8">
            <button
              onClick={() => window.history.back()}
              className="block w-full text-center text-yellow-600 hover:text-yellow-700 hover:underline font-medium flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OtpVerifPage;
