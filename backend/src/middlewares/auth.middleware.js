const jwt = require("jsonwebtoken");
const config = require("../../config");
const asyncHandler = require("./asyncHandler");
const ApiError = require("../utils/ApiError");
const { User } = require("../model");

// Verifica el JWT (de la cookie httpOnly o del header Authorization) y
// adjunta el usuario autenticado en req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "No autorizado, inicia sesión");
  }

  const decoded = jwt.verify(token, config.jwtSecret);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, "El usuario de este token ya no existe");
  }
  if (!user.activo) {
    throw new ApiError(403, "Tu cuenta está desactivada, contacta al administrador");
  }

  req.user = user;
  next();
});

// Restringe una ruta a ciertos roles: authorize("admin"), authorize("admin", "empleado")
function authorize(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "No autorizado, inicia sesión"));
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return next(new ApiError(403, "No tienes permisos para realizar esta acción"));
    }
    next();
  };
}

module.exports = { protect, authorize };
