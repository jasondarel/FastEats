import axios from "axios";
import { PROVINCES_URL, CITIES_URL, DISTRICTS_URL, VILLAGES_URL } from "../../config/api";

export const getProvincesService = async() => {
  try {
    const response = await axios.get(PROVINCES_URL);
    return response;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    throw error;
  }
}

export const getCitiesService = async(provinceId) => {
  try {
    const response = await axios.get(`${CITIES_URL}/${provinceId}.json`);
    return response;
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error;
  }
}

export const getDistrictsService = async(cityId) => {
  try {
    const response = await axios.get(`${DISTRICTS_URL}/${cityId}.json`);
    return response;
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
}

export const getVillagesService = async(districtId) => {
  try {
    const response = await axios.get(`${VILLAGES_URL}/${districtId}.json`);
    return response;
  } catch (error) {
    console.error("Error fetching villages:", error);
    throw error;
  }
}