import axios from "axios";
import { API_URL } from "../../config/api";

const createNewMenuService = async (formData, token) => {
  const response = await axios.post(
    `${API_URL}/restaurant/menu`,
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

export default createNewMenuService;
