const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { createPurchase, getPurchases, getPurchase } = require("../controller/purchase.controller");

const router = express.Router();

// Las compras son información de costos: solo el admin las registra y las ve.
router.use(protect, authorize("admin"));

router.get("/", getPurchases);
router.get("/:id", getPurchase);
router.post("/", createPurchase);

module.exports = router;
