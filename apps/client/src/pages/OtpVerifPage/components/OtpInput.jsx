import { useRef, useEffect } from "react";

const OtpInput = ({ otp, setOtp, length = 6 }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (index, e) => {
    const value = e.target.value;

    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value !== "" && index < length - 1) {
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

      for (let i = index; i < length - 1; i++) {
        newOtp[i] = newOtp[i + 1];
      }
      newOtp[length - 1] = "";

      setOtp(newOtp);
    }
  };

  return (
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
  );
};

export default OtpInput;
