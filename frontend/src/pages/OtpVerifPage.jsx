import { useState, useEffect, useRef } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { API_URL } from "../config/api";

const OtpVerification = () => {
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
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
        `${API_URL}/user/verify-token?token=${token}&email=${emailQuery}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (!data.success) {
        setError(data.message || "Failed to verify token");
        MySwal.fire({
          title: "Error",
          text: data.message || "Failed to verify token",
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#ef4444",
        }).then(() => {
          navigate("/register");
        });
      }
    } catch (err) {
      setError(err.message || "Failed to verify token");
      MySwal.fire({
        title: "Error",
        text: err.message || "Failed to verify token",
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  useEffect(() => {
    checkToken();
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, [isVerified]);

  const verifyOtp = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      MySwal.fire({
        title: "Error",
        text: "Please enter all 6 digits",
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailQuery,
          token: token,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        MySwal.fire({
          title: "Success",
          text: data.message,
          icon: "success",
          confirmButtonText: "Ok",
          confirmButtonColor: "#10b981",
        }).then(() => {
          setIsVerified(true);
          navigate("/login");
        });
      } else {
        MySwal.fire({
          title: "Error",
          text: data.message,
          icon: "error",
          confirmButtonText: "Ok",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      MySwal.fire({
        title: "Error",
        text: err.message || "Failed to verify OTP",
        icon: "error",
        confirmButtonText: "Ok",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleChange = (index, e) => {
    const value = e.target.value;

    // Handle digit input
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to remove digit and shift others
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        // Move focus to previous input
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "Backspace") {
      // When backspace is pressed on a non-empty input
      const newOtp = [...otp];

      // Remove the current digit and shift subsequent digits
      for (let i = index; i < 5; i++) {
        newOtp[i] = newOtp[i + 1];
      }
      newOtp[5] = ""; // Clear the last digit

      setOtp(newOtp);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
      <div
        className="absolute top-4 left-4 cursor-pointer group"
        onClick={() => navigate("/login")}
      >
        <div className="p-2 bg-white/50 rounded-full hover:bg-white/70 transition-all duration-300 ease-in-out">
          <ArrowLeft
            className="text-yellow-600 group-hover:translate-x-[-4px] transition-transform"
            size={24}
          />
        </div>
      </div>

      <div
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-yellow-100 
        transform transition-all duration-500 hover:scale-[1.02]"
      >
        <div className="flex justify-center mb-6">
          <ShieldCheck className="text-yellow-600 animate-pulse" size={64} />
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Verify Your Account
        </h2>
        <p className="text-center text-gray-500 mb-2">
          Enter the 6-digit code sent to Your Email...
        </p>
        <p className="text-center text-yellow-600 font-semibold mb-4">
          {emailQuery || ""}
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 border-2 border-yellow-200 rounded-lg text-center 
              text-2xl font-bold text-yellow-800 
              focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent 
              transition-all duration-300 ease-in-out 
              hover:shadow-md hover:border-yellow-400"
            />
          ))}
        </div>

        <button
          onClick={verifyOtp}
          className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white 
          font-bold rounded-lg transition-all duration-300 ease-in-out 
          transform hover:scale-[1.02] active:scale-[0.98] 
          shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
