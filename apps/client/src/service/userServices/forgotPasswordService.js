import axios from "axios";
import { API_URL } from "../../config/api";

export const sendResetEmailService = async(email) => {
    try {
        const response = await axios.post(`${API_URL}/user/send-reset-password-req`, {
        email,
        });
        return response;
    } catch (error) {
        throw error.response;
    }
}

export const verifyResetPasswordTokenService = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/user/verify-reset-password-token?token=${token}`);
    return response;
  } catch (error) {
    if (error.response) {
      throw error.response;
    } else {
      throw error;
    }
  }
};

export const resetPasswordService = async (token, password, passwordConfirmation) => {
    try {
        const response = await axios.post(`${API_URL}/user/reset-password?token=${token}`, {
            password,
            passwordConfirmation
        });
        return response;
    } catch(err) {
        if (err.response) {
            throw err.response;
        } else {
            throw err;
        }
    }
}