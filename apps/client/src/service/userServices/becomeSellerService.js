import axios from "axios";
import { API_URL } from "../../config/api";

const becomeSellerService = async (formData, token) => {
  const response = await axios.post(
    `${API_URL}/user/become-seller`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
};

export default becomeSellerService;
