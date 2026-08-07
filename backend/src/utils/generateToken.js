const jwt = require("jsonwebtoken");
const config = require("../../config");

function generateToken(user) {
  return jwt.sign({ id: user._id, rol: user.rol }, config.jwtSecret, {
    expiresIn: "8h",
  });
}

// Manda el JWT en una cookie httpOnly y también lo devuelve en el body,
// así sirve tanto para un frontend web (cookie) como para pruebas con
// Postman/Thunder Client (header Authorization: Bearer <token>).
function sendTokenResponse(res, statusCode, user) {
  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: config.nodeEnv === "production" ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000, // 8 horas
  });

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
}

module.exports = { generateToken, sendTokenResponse };
