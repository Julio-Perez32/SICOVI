const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  getSummary,
  getSalesTimeseries,
  getTopProducts,
  getMarginByCategory,
  getSalesByEmployee,
  getSalesByPaymentMethod,
  getRecentActivity,
} = require("../controller/dashboard.controller");

const router = express.Router();

// Todo el dashboard (KPIs, márgenes, etc.) es información sensible: solo admin.
router.use(protect, authorize("admin"));

router.get("/summary", getSummary);
router.get("/sales-timeseries", getSalesTimeseries);
router.get("/top-products", getTopProducts);
router.get("/margin-by-category", getMarginByCategory);
router.get("/sales-by-employee", getSalesByEmployee);
router.get("/sales-by-payment-method", getSalesByPaymentMethod);
router.get("/recent-activity", getRecentActivity);

module.exports = router;
