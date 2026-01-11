import { ShieldCheck } from "lucide-react";

const VerificationHeader = ({ email }) => {
  return (
    <>
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
        {email || ""}
      </p>
    </>
  );
};

export default VerificationHeader;
