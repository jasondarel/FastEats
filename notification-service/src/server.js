import express from "express";
import logger from "./config/loggerInit.js";
import startConsumer from "./service/user-service/emailValidationConsumer.js";
import envInit from "./config/envInit.js";

envInit();
logger.info(`Using ${process.env.NODE_ENV} mode`);

const app = express();
app.use(express.json());


app.get("/", (req, res) => {
  res.send("📩 Email Verification Consumer Running...");
});

startConsumer();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
