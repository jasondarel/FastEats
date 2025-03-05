import axios from "axios";

const updateMenuService = async (menuId, formData, token) => {
  const response = await axios.put(
    `http://localhost:5000/restaurant/menu/${menuId}`,
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
    `http://localhost:5000/restaurant/menu/${menuId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

export { updateMenuService, deleteMenuService };
