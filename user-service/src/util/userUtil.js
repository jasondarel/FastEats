import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });
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
  const phoneRegex = /^\d{12}$/; // Exactly 12 digits
  return phoneRegex.test(phone);
}

export {
  hashPassword,
  generateToken,
  validateEmail,
  validatePhoneNumber,
  validatePassword,
};
