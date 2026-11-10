const jwt = require("jsonwebtoken");

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function generateResetToken(userId) {
  return jwt.sign(
    { id: userId, purpose: "password-reset" },
    process.env.JWT_SECRET,
    { expiresIn: "30m" }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, generateResetToken, verifyToken };