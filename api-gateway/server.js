import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({
    origin: [
        "http://localhost:5173"
    ]
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

console.log(
  `${process.env.SERVICE_NAME || "User/Auth Service"} running on port ${PORT}`
);

app.get("/restaurants", async (req, res) => {
    try {
        const token = req.headers.authorization;
      const response = await axios.get(
        "https://b111-61-5-30-124.ngrok-free.app/restaurants",
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
  });  


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
