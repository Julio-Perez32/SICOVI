const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/category.controller");

const router = express.Router();

router.use(protect);

router.get("/", getCategories);
router.post("/", authorize("admin"), createCategory);
router.put("/:id", authorize("admin"), updateCategory);
router.delete("/:id", authorize("admin"), deleteCategory);

module.exports = router;
