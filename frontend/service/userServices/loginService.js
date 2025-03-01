import axios from "axios";

const loginService = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:5000/user/login", {
      email,
      password,
    });
    return response;
  } catch (error) {
    throw error.response.data.errors;
  }
};

export default loginService;