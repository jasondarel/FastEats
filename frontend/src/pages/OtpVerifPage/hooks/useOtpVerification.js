import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { API_URL } from "../../../config/api";

export const useOtpVerification = (email, token, navigate) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const MySwal = withReactContent(Swal);

  const checkToken = async () => {
    if (!token || isVerified) return;
    console.log("Checking token:", token, "for email:", email);

    try {
      const response = await fetch(
        `${API_URL}/user/verify-token?token=${token}&email=${email}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      console.log("Token verification response:", data);

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
      console.error("Error verifying token:", err);
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
          email: email,
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

  useEffect(() => {
    checkToken();
  }, [isVerified]);

  return {
    otp,
    setOtp,
    error,
    isVerified,
    verifyOtp,
  };
};
