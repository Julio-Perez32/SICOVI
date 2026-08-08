const { sendTokenResponse } = require("../utils/generateToken");
const { User } = require("../model");

const authController = {};

// POST /api/auth/login
// Acepta { email, password } (el admin) o { username, password } (la
// cuenta compartida de ventas -- más fácil de escribir que un correo).
authController.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({ success: false, message: "Usuario/correo y contraseña son obligatorios" });
    }

    const query = username ? { username: username.toLowerCase() } : { email: email.toLowerCase() };
    const user = await User.findOne(query).select("+password");
    if (!user || !(await user.compararPassword(password))) {
      return res.status(401).json({ success: false, message: "Usuario/correo o contraseña incorrectos" });
    }
    if (!user.activo) {
      return res.status(403).json({ success: false, message: "Tu cuenta está desactivada, contacta al administrador" });
    }

    user.password = undefined;
    sendTokenResponse(res, 200, user);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/logout
authController.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Sesión cerrada" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
authController.me = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/auth/me/password
authController.changeMyPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ success: false, message: "Debes enviar la contraseña actual y la nueva" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.compararPassword(passwordActual))) {
      return res.status(401).json({ success: false, message: "La contraseña actual no es correcta" });
    }

    user.password = passwordNueva;
    await user.save();

    res.status(200).json({ success: true, message: "Contraseña actualizada" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/employees (admin)
authController.createEmployee = async (req, res) => {
  try {
    const { nombre, email, username, password, telefono, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ success: false, message: "Nombre, correo y contraseña son obligatorios" });
    }

    const user = await User.create({
      nombre,
      email,
      username: username || undefined,
      password,
      telefono,
      rol: rol === "admin" ? "admin" : "empleado",
    });
    user.password = undefined;

    res.status(201).json({ success: true, user });
  } catch (error) {
    const status = error.code === 11000 ? 409 : 400;
    res.status(status).json({ success: false, message: error.code === 11000 ? "Ya existe un usuario con ese correo o username" : error.message });
  }
};

// GET /api/auth/employees (admin)
authController.listEmployees = async (req, res) => {
  try {
    const filtro = {};
    if (req.query.rol) filtro.rol = req.query.rol;
    if (req.query.activo !== undefined) filtro.activo = req.query.activo === "true";

    const users = await User.find(filtro).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/auth/employees/:id (admin)
authController.updateEmployee = async (req, res) => {
  try {
    const { nombre, telefono, rol, activo, username } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    if (nombre !== undefined) user.nombre = nombre;
    if (telefono !== undefined) user.telefono = telefono;
    if (rol !== undefined) user.rol = rol;
    if (activo !== undefined) user.activo = activo;
    if (username !== undefined) user.username = username || undefined;

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    const duplicado = error.code === 11000;
    res.status(duplicado ? 409 : 400).json({
      success: false,
      message: duplicado ? "Ya existe un usuario con ese username" : error.message,
    });
  }
};

// PATCH /api/auth/employees/:id/password (admin)
// A diferencia de changeMyPassword, esto lo hace el admin sobre la cuenta
// de otro usuario (ej. la cuenta compartida "Empleado") sin necesitar la
// contraseña actual -- es un reset, no un autoservicio.
authController.resetEmployeePassword = async (req, res) => {
  try {
    const { passwordNueva } = req.body;
    if (!passwordNueva || passwordNueva.length < 6) {
      return res.status(400).json({ success: false, message: "La contraseña nueva debe tener al menos 6 caracteres" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado" });

    user.password = passwordNueva;
    await user.save();

    res.status(200).json({ success: true, message: "Contraseña restablecida" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = authController;
