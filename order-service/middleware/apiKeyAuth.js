import dotenv from "dotenv";

dotenv.config();

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"]; // Ambil API Key dari request header
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API Key" });
  }
  next(); // Lanjut ke endpoint
};

export default apiKeyAuth;
