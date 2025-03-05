import axios from "axios";

const registerService = async (formData, userType = "user") => {
  // Adjust endpoint based on user type
  const endpoint =
    userType === "seller"
      ? "http://localhost:5000/user/register/seller"
      : "http://localhost:5000/user/register";

  // Set proper headers for FormData
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  const otpToken = await axios.post(endpoint, formData, config);
  return otpToken;
};

export default registerService;
