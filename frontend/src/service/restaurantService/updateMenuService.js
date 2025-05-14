import axios from "axios";
import { API_URL } from "../../config/api";

const updateMenuService = async (menuId, formData, token) => {
  const response = await axios.put(
    `${API_URL}/restaurant/menu/${menuId}`,
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

const deleteMenuService = async (menuId, token) => {
  const response = await axios.delete(
    `${API_URL}/restaurant/menu/${menuId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

export { updateMenuService, deleteMenuService };
