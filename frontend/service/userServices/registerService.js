import axios from "axios";

const registerService = async (name, email, password, confirmPassword) => {
    const otpToken = await axios.post("http://localhost:5000/user/register", {
        name,
        email,
        password,
        confirmPassword,
    });
  return otpToken
};

export default registerService;
