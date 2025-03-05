import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import BackButton from "../components/BackButton";

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
        `http://localhost:5000/user/verify-token?token=${token}&email=${emailQuery}`,
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

  const handleChange = (index, value) => {
    const newOtp = [...otp];

    if (/^\d?$/.test(value)) {
      newOtp[index] = value;
      setOtp(newOtp);

      // Move forward if value is entered and not last input
      if (value !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace behavior
    if (e.key === "Backspace") {
      // If current input is empty, move to previous input
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      // If current input is not empty, clear it
      else if (otp[index] !== "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
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

        <div className="flex justify-center gap-3 my-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
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
