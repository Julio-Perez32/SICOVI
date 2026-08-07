const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre/razón social del proveedor es obligatorio"],
      trim: true,
    },
    nit: {
      type: String,
      trim: true,
    },
    nrc: {
      type: String,
      trim: true,
    },
    direccion: {
      type: String,
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
