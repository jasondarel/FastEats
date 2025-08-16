import jwt from "jsonwebtoken";
import logger from "../config/loggerInit.js";

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    logger.warn(`[AUTH] Unauthorized access attempt from ${req.ip}`);
    return res.status(401).json({
      success: false,
      message: "Access Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    req.user = decoded;
    next();
  } catch (error) {
    logger.error(`[AUTH] Unexpected error: ${error.message}`);
    return res.status(403).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

export default authMiddleware;
