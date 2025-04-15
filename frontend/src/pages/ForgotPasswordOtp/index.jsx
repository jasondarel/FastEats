import BackgroundImage from "./components/BackgroundImage";
import { useState, useEffect, useRef } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import withReactContent from "sweetalert2-react-content";
import { API_URL } from "../../config/api";
import Swal from "sweetalert2";

const ForgotPasswordOtp = () => {
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
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "Backspace") {
      const newOtp = [...otp];

      for (let i = index; i < 5; i++) {
        newOtp[i] = newOtp[i + 1];
      }
      newOtp[5] = "";

      setOtp(newOtp);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      <BackgroundImage imagePath="/foodbg.jpg" />

      {}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-yellow-100 
          transform transition-all duration-500 hover:scale-[1.02] mx-4"
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
                className="w-12 h-14 border-2 border-yellow-400 rounded-lg text-center 
                text-2xl font-bold text-yellow-800 
                focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent 
                transition-all duration-300 ease-in-out 
                hover:shadow-md hover:border-yellow-500"
              />
            ))}
          </div>

          <button
            onClick={verifyOtp}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 hover:cursor-pointer text-white 
            font-bold rounded-lg transition-all duration-300 ease-in-out 
            transform hover:scale-[1.02] active:scale-[0.98] 
            shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Verify OTP
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center mx-auto text-yellow-500 hover:text-yellow-600 transition-colors hover:cursor-pointer"
            >
              <ArrowLeft className="mr-1" size={16} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordOtp;
