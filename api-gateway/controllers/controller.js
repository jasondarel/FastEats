import axios from "axios"

const getRestaurantsController = async(req, res) => {
    try {
        const token = req.headers.authorization;
      const response = await axios.get(
        `${process.env.RESTAURANT_SERVICE_URL}/restaurants`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.data) {
        return res.status(500).json({
          success: false,
          message: "Invalid response from the external API",
        });
      }
  
      return res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (err) {
      console.error("Error fetching restaurants:", err.message);
  
      if (err.response) {
        return res.status(err.response.status || 500).json({
          success: false,
          message: err.response.data || "Error from external API",
        });
      }
  
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
}

const loginController = async(req, res) => {
    const userReq = req.body;

    if (!userReq || !userReq.email || !userReq.password) {
        return res.status(400).json({ error: "email and password are required!" });
    }

    try {
        const response = await axios.post(`${process.env.USER_SERVICE_URL}/login`, userReq);
        
        if (response.data && response.data.token) {
            return res.status(200).json({ token: response.data.token });
        } else {
            return res.status(500).json({ error: "Invalid response from authentication server" });
        }
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ error: "Login failed. Please try again later." });
    }
}

export {
    getRestaurantsController,
    loginController
}