import axios from "axios";

const registerService = async (name, email, password) => {
  const response = await axios.post("http://localhost:5000/user/register", {
    name,
    email,
    password,
  });
  return response.data
};

export default registerService;
