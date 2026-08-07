const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { createSale, getSales, getSale, voidSale } = require("../controller/sale.controller");

const router = express.Router();

router.use(protect);

router.get("/", getSales); // admin: todas | empleado: solo las suyas
router.get("/:id", getSale);
router.post("/", createSale); // admin o empleado pueden registrar una venta
router.patch("/:id/void", authorize("admin"), voidSale);

module.exports = router;
