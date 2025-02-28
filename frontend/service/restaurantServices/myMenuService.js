import axios from "axios";

const createNewMenuService = async (formData, token) => {
  const response = await axios.post(
    "http://localhost:5000/restaurant/menu",
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
