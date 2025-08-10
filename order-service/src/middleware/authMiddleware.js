import jwt from 'jsonwebtoken';
import logger from '../config/loggerInit.js';
import envInit from '../config/envInit.js';

envInit();

const internalAPIKey = process.env.INTERNAL_API_KEY;

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        logger.warn(`[AUTH] Unauthorized access attempt from ${req.ip} (missing token)`);
        return res.status(401).json({
        success: false,
        message: "Access Unauthorized"
        });
    }

    const token = authHeader.replace('Bearer ', '');
    if (token === internalAPIKey) {
        req.user = {
        role: "internal_service",
        source: "internal",
        };
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        logger.error(`[AUTH] Invalid token: ${error.message}`);
        return res.status(403).json({
        success: false,
        message: "Invalid Token"
        });
    }
};

export default authMiddleware;
