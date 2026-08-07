const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const uploadProductImage = require("../middlewares/upload.middleware");
const {
  getProducts,
  getLowStockProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controller/product.controller");

const router = express.Router();

router.use(protect); // admin y empleado necesitan estar logueados para ver el catálogo

router.get("/", getProducts);
router.get("/low-stock", authorize("admin"), getLowStockProducts);
router.get("/:id", getProduct);

router.post("/", authorize("admin"), uploadProductImage.single("imagen"), createProduct);
router.put("/:id", authorize("admin"), uploadProductImage.single("imagen"), updateProduct);
router.delete("/:id", authorize("admin"), deleteProduct);

module.exports = router;
