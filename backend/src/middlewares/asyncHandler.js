// Envuelve un controller async para no repetir try/catch: cualquier error
// cae directo en el errorHandler centralizado (middlewares/error.middleware.js).
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
