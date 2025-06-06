import axios from "axios";
import { API_URL } from "../../config/api";

export const registerService = async (formData, userType = "user") => {
  try {
    const endpoint = userType === "seller" ? `${API_URL}/user/register/seller` : `${API_URL}/user/register`;
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const response = await axios.post(endpoint, formData, config);
    console.log("Registration response:", response.data);
    return response.data.otpToken;
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response?.data || { message: "An error occurred during registration" };
  }
};