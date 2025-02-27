import axios from "axios";

const loginService = async (email, password) => {
  try {
    const response = await axios.post("http://localhost:5000/user/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data.message : "An error occurred";
  }
};

export default loginService;
