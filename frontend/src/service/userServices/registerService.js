import axios from "axios";
import { API_URL } from "../../config/api";

const registerService = async (formData, userType = "user") => {
  // Adjust endpoint based on user type
  const endpoint =
    userType === "seller"
      ? `${API_URL}/user/register/seller`
      : `${API_URL}/user/register`;

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
