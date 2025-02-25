import "dotenv/config";
import express from "express";
import cors from "cors";
import createTable from "./config/tableinit.js";

// Routes
import OrderRoutes from "./routes/OrderRoutes.js";

//middleware
import apiKeyAuth from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.use(OrderRoutes);

createTable();

app.listen(PORT, () => {
  console.log(
    `${process.env.SERVICE_NAME || "Service"} running on port ${PORT}`
  );
});

// Middleware to verify token
// app.use((req, res, next) => {
//   if (req.path === "/") return next(); // Allow health check

//   const token = req.headers.authorization?.split(" ")[1];
//   const user = token ? verifyToken(token) : null;

//   if (!user) return res.status(401).json({ error: "Unauthorized" });

//   req.user = user;
//   next();
// });
