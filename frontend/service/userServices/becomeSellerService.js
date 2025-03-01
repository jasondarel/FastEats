import axios from "axios";

const becomeSellerService = async (formData, token) => {
  const response = await axios.post(
    "http://localhost:5000/user/become-seller",
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
