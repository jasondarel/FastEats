import axios from "axios";
import { API_URL } from "../../config/api";

/**
 * Logout service - sends logout request to server to invalidate session
 * @param {string} token - JWT token for authentication
 * @returns {Promise} - Response from server
 */
const logoutService = async (token) => {
    try {
        const response = await axios.post(
            `${API_URL}/user/logout`,
            {}, // Empty body for POST request
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        localStorage.removeItem("token");
        return response;
    } catch (error) {
        console.error("Logout service error:", error);
        localStorage.removeItem("token");
        throw error;
    }
};

export default logoutService;