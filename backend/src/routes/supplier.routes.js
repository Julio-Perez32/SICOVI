const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controller/supplier.controller");

const router = express.Router();

router.use(protect);

router.get("/", getSuppliers);
router.post("/", authorize("admin"), createSupplier);
router.put("/:id", authorize("admin"), updateSupplier);
router.delete("/:id", authorize("admin"), deleteSupplier);

module.exports = router;
