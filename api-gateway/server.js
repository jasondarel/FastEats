import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getRestaurantsController,
  loginController,
  homeProfileController,
} from "./controllers/controller.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

console.log(
  `${process.env.SERVICE_NAME || "User/Auth Service"} running on port ${PORT}`
);

app.get("/restaurant/restaurants", getRestaurantsController);

app.post("/user/login", loginController);

app.get("/user/profile", homeProfileController);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
