import axios from "axios";
import { API_URL } from "../../config/api";

const getProfileService = async (token) => {
  const res = await axios.get(`${API_URL}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

const saveProfileService = async (profile, preview, token) => {
  const response = await axios.put(
    `${API_URL}/user/profile`,
    { ...profile, profile_photo: preview },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const changePasswordService = async (changePassword, token) => {
  const response = await axios.put(
    `${API_URL}/user/change-password`,
    changePassword,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export { getProfileService, saveProfileService, changePasswordService };
