import axios from "axios";
import { API_URL } from "../../config/api";

const loginService = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/user/login`, {
      email,
      password,
    });
    return response;
  } catch (error) {
    throw error.response;
  }
};

export default loginService;
