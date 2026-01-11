import crypto from "crypto";
import jwt from "jsonwebtoken";
import { 
  EXCHANGE_NAME,
  getChannel, 
  EMAIL_RESET_PASSWORD_ROUTING_KEY,
  EMAIL_VERIFICATION_ROUTING_KEY
} from "../config/rabbitMQInit.js";
import logger from "../config/loggerInit.js";
import { getRedisClient } from "../config/redisInit.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export const generateLoginToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

export const getTokenRemainingTime = async (token) => {
  try {
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    const remainingSeconds = expirationTime - currentTime;
    
    if (remainingSeconds <= 0) {
      return {
        expired: true,
        remainingSeconds: 0,
        remainingMinutes: 0,
        remainingHours: 0,
        expiresAt: new Date(expirationTime * 1000).toISOString()
      };
    }
    
    return {
      expired: false,
      remainingSeconds,
      remainingMinutes: Math.floor(remainingSeconds / 60),
      remainingHours: Math.floor(remainingSeconds / 3600),
      expiresAt: new Date(expirationTime * 1000).toISOString(),
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export const isTokenBlacklisted = async(token) => {
  const redisClient = getRedisClient();
  const isBlacklisted = await redisClient.get(`blacklist_${token}`);
  return isBlacklisted === 'true';
}

export const generateRandomToken = (len) => {
  return crypto.randomBytes(len).toString("hex");
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\d{12}$/;
  return phoneRegex.test(phone);
}

export const publishVerificationEmailMessage = async(email, token, otp) => {
  const channel = await getChannel();

  const message = JSON.stringify({ email, token, otp });

  channel.publish(EXCHANGE_NAME, EMAIL_VERIFICATION_ROUTING_KEY, Buffer.from(message), {
    persistent: true,
  });

  logger.info(`📨 Sent verification email to ${email}`);
};

export const publishResetPasswordEmailMessage = async(email, token) => {
  const channel = await getChannel();

  const message = JSON.stringify({ email, token });

  channel.publish(
    EXCHANGE_NAME, 
    EMAIL_RESET_PASSWORD_ROUTING_KEY, Buffer.from(message), {
    persistent: true,
  });

  logger.info(`📨 Sent reset password email to ${email}`);
};

export const generateOtpCode = (len) => {
  const characters = '12345678';
  let result = '';
  for (let i = 0; i < len; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
  }
  return result;
};