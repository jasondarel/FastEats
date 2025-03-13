import jwt from "jsonwebtoken";
import logger from "../config/loggerInit.js";

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn(`[AUTH] Unauthorized access attempt from ${req.ip}`);
        return res.status(401).json({
            success: false,     
            message: "Access Unauthorized: No Token Provided"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            logger.warn(`[AUTH] Expired token from ${req.ip}`);
            return res.status(401).json({
                success: false,
                message: "Access Unauthorized: Token Expired"
            });
        } else if (error.name === "JsonWebTokenError") {
            logger.warn(`[AUTH] Invalid token from ${req.ip}`);
            return res.status(401).json({
                success: false,
                message: "Access Unauthorized: Invalid Token"
            });
        } else {
            logger.error(`[AUTH] Unexpected error: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    }
};

export default authMiddleware;
