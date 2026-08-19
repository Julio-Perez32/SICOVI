const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require("../controller/service.controller");

const router = express.Router();

router.use(protect);

// El empleado necesita leer los servicios para poder facturarlos.
router.get("/", getServices);

router.post("/", authorize("admin"), createService);
router.put("/:id", authorize("admin"), updateService);
router.delete("/:id", authorize("admin"), deleteService);

module.exports = router;
