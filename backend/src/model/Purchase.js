const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    codigo: { type: String, required: true, trim: true, uppercase: true },
    descripcion: { type: String, trim: true },
    cantidad: { type: Number, required: true, min: 0.01 },
    precioUnitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "La compra debe estar asociada a un proveedor"],
    },
    numeroDocumento: {
      type: String,
      trim: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    registradoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [purchaseItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "La compra debe tener al menos un producto",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    notas: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
