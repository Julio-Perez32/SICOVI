const ApiError = require("../utils/ApiError");

// 404 para rutas que no existen
function notFound(req, res, next) {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Manejador central de errores. Traduce errores típicos de Mongoose a
// respuestas HTTP consistentes: { success: false, message, errors? }
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || "Error interno del servidor";
  let errors;

  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = "Datos inválidos";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Id inválido: ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const campo = Object.keys(err.keyValue || {})[0];
    message = campo ? `Ya existe un registro con ese ${campo}` : "Registro duplicado";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token inválido";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "La sesión expiró, inicia sesión de nuevo";
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

module.exports = { notFound, errorHandler };
