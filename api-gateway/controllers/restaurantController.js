import axios from "axios";

const getRestaurantsController = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const response = await axios.get(
      `${process.env.RESTAURANT_SERVICE_URL}/restaurants`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
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
};



export { 
    getRestaurantsController
};
