const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// Sube la foto del producto directo a Cloudinary (carpeta "sicovi/productos")
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sicovi/productos",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const uploadProductImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = uploadProductImage;
