const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  login,
  logout,
  me,
  changeMyPassword,
  createEmployee,
  listEmployees,
  updateEmployee,
  resetEmployeePassword,
} = require("../controller/auth.controller");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);

router.get("/me", protect, me);
router.patch("/me/password", protect, changeMyPassword);

// Gestión de usuarios: solo el admin
router.post("/employees", protect, authorize("admin"), createEmployee);
router.get("/employees", protect, authorize("admin"), listEmployees);
router.patch("/employees/:id", protect, authorize("admin"), updateEmployee);
router.patch("/employees/:id/password", protect, authorize("admin"), resetEmployeePassword);

module.exports = router;
