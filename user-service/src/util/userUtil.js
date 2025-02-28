import crypto from "crypto";
import jwt from "jsonwebtoken";
import { 
  EXCHANGE_NAME,
  getChannel, 
  ROUTING_KEY
} from "../config/rabbitMQInit.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateLoginToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
}

function generateValidationEmailToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "6m" });
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

function validatePhoneNumber(phone) {
  const phoneRegex = /^\d{12}$/;
  return phoneRegex.test(phone);
}

export const publishMessage = async (email, token, otp) => {
  const channel = await getChannel();

  const message = JSON.stringify({ email, token, otp });

  channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(message), {
    persistent: true,
  });

  console.log(`📨 Sent verification email to ${email}`);
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

export {
  hashPassword,
  generateLoginToken,
  generateValidationEmailToken,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
};
