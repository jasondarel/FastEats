import { useNavigate } from "react-router-dom";
import BackButton from "./components/BackButton";
import VerificationHeader from "./components/VerificationHeader";
import OtpInput from "./components/OtpInput";
import { useOtpVerification } from "./hooks/useOtpVerification";

const OtpVerification = () => {
  const navigate = useNavigate();
  const emailQuery = new URLSearchParams(window.location.search).get("email");
  const token = new URLSearchParams(window.location.search).get("token");

  const { otp, setOtp, error, isVerified, verifyOtp } = useOtpVerification(
    emailQuery,
    token,
    navigate
  );

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
      <BackButton onClick={() => navigate("/login")} />

      <div
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-yellow-100 
        transform transition-all duration-500 hover:scale-[1.02]"
      >
        <VerificationHeader email={emailQuery} />

        <OtpInput otp={otp} setOtp={setOtp} />

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
