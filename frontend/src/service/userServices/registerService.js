import axios from "axios";
import { API_URL } from "../../config/api";

// Normal registration
export const registerService = async (formData, userType = "user") => {
  try {
    const endpoint =
      userType === "seller"
        ? `${API_URL}/user/register/seller`
        : `${API_URL}/user/register`;

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    const response = await axios.post(endpoint, formData, config);
    console.log("Registration response:", response.data);
    return response.data.token;
  } catch (error) {
    console.error("Registration error:", error);
    throw (
      error.response?.data?.error ||
      error.response?.data?.message || {
        message: "An error occurred during registration",
      }
    );
  }
};

export const completeGoogleRegistrationService = async (
  googleProfile,
  registrationData
) => {
  try {
    const response = await axios.post(
      `${API_URL}/user/register/google`,
      {
        google_id: googleProfile.id,
        email: googleProfile.email,
        avatar: googleProfile.avatar,
        name: registrationData.name,
        role: registrationData.role,
        restaurantName: registrationData.restaurantName,
        restaurantAddress: registrationData.restaurantAddress,
        restaurantProvince: registrationData.restaurantProvince,
        restaurantCity: registrationData.restaurantCity,
        restaurantDistrict: registrationData.restaurantDistrict,
        restaurantVillage: registrationData.restaurantVillage,
        restaurantAlamat: registrationData.restaurantAlamat,
      }
    );

    

    console.log("Google complete registration response:", response.data);
    return response.data.user;
  } catch (error) {
    console.error("Google registration error:", error);
    console.log("Payload sent to /user/register/google:", {
  google_id: googleProfile.id,
  email: googleProfile.email,
  avatar: googleProfile.avatar,
  name: registrationData.name,
  role: registrationData.role,
  restaurantName: registrationData.restaurantName,
  restaurantAddress: registrationData.restaurantAddress,
  restaurantProvince: registrationData.restaurantProvince,
  restaurantCity: registrationData.restaurantCity,
  restaurantDistrict: registrationData.restaurantDistrict,
  restaurantVillage: registrationData.restaurantVillage,
  restaurantAlamat: registrationData.restaurantAlamat,
});

    throw (
      error.response?.data?.errors ||
      error.response?.data?.message || {
        general: "An error occurred during Google registration",
      }
    );
  }
};
