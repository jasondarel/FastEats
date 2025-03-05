import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const OtpVerification = () => {
  const navigate = useNavigate();
  const emailQuery = new URLSearchParams(window.location.search).get("email");
  const token = new URLSearchParams(window.location.search).get("token");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef([]);

  const checkToken = async () => {
    if (!token || isVerified) return;

    try {
      const response = await fetch(
        `http://localhost:5000/user/verify-token?token=${token}&email=${emailQuery}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (!data.success) {
        setError(data.message || "Failed to verify token");
        alert(data.message);
        navigate("/register");
      }
    } catch (err) {
      setError(err.message || "Failed to verify token");
    }
  };

  useEffect(() => {
    checkToken();
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, [isVerified]);

  const verifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailQuery,
          token: token,
          otp: otpValue,
        }),
      });

      const data = await response.json();
      alert(data.message);

      if (data.success) {
        setIsVerified(true);
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Failed to verify OTP");
    }
  };

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255, 230, 100, 0.6), rgba(255, 230, 100, 0.8)), url('/delivery.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <BackButton to="/login" />
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          OTP Verification
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="flex justify-center gap-3 my-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-12 h-12 border-2 border-gray-300 rounded-md text-center text-xl font-semibold focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            />
          ))}
        </div>

        <button
          onClick={verifyOtp}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
