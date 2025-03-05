import axios from "axios";

const getProfileService = async (token) => {
  const res = await axios.get("http://localhost:5002/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

const saveProfileService = async (profile, preview, token) => {
  const response = await axios.put(
    "http://localhost:5002/profile",
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
    "http://localhost:5002/change-password",
    changePassword,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export { getProfileService, saveProfileService, changePasswordService };
