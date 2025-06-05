import axios from "axios";
import { API_URL, PROVINCES_URL, CITIES_URL, DISTRICTS_URL, VILLAGES_URL } from "../../config/api";

export const registerService = async (formData, userType = "user") => {
  try {
    const endpoint = userType === "seller" ? `${API_URL}/user/register/seller` : `${API_URL}/user/register`;
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    const response = await axios.post(endpoint, formData, config);
    console.log("Registration response:", response.data);
    return response.data.otpToken;
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response?.data || { message: "An error occurred during registration" };
  }
};

export const getProvincesService = async() => {
  try {
    const response = await axios.get(PROVINCES_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw error;
  }
}

export const getCitiesService = async(provinceId) => {
  try {
    const response = await axios.get(`${CITIES_URL}/${provinceId}.json`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error;
  }
}

export const getDistrictsService = async(cityId) => {
  try {
    const response = await axios.get(`${DISTRICTS_URL}/${cityId}.json`);
    return response.data;
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
}

export const getVillagesService = async(districtId) => {
  try {
    const response = await axios.get(`${VILLAGES_URL}/${districtId}.json`);
    return response.data;
  } catch (error) {
    console.error("Error fetching villages:", error);
    throw error;
  }
}