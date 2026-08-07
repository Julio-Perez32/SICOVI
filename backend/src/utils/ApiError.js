// Error con status HTTP explícito, para lanzar desde los controllers
// (ej: throw new ApiError(404, "Producto no encontrado")) y que lo
// recoja el errorHandler centralizado.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
