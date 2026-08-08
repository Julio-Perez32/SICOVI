const mongoose = require("mongoose");
const config = require("../../config");

const productSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, "El código del producto es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nombre: {
      type: String,
      required: [true, "El nombre/descripción del producto es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },
    unidadMedida: {
      type: String,
      trim: true,
      default: "UNIDAD",
    },
    ubicacion: {
      type: String,
      trim: true,
    },
    precioCosto: {
      type: Number,
      required: [true, "El precio de costo es obligatorio"],
      min: 0,
      default: 0,
    },
    precioVenta: {
      type: Number,
      required: [true, "El precio de venta es obligatorio"],
      min: 0,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stockMinimo: {
      type: Number,
      min: 0,
      default: config.defaultStockMinimo,
    },
    imagen: {
      type: String,
      default: null,
    },
    imagenPublicId: {
      type: String,
      default: null,
    },
    // Qué tan grave era la última alerta de stock que se avisó para este
    // producto ("stock_bajo" | "sin_stock" | null si está saludable). Se
    // compara por severidad (no un simple sí/no) en utils/stockAlert.js
    // para poder volver a avisar si, después de reabastecer un poco sin
    // llegar al mínimo, el producto se vuelve a quedar en cero.
    ultimoTipoAlerta: {
      type: String,
      enum: ["stock_bajo", "sin_stock", null],
      default: null,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.virtual("margen").get(function margen() {
  return Number((this.precioVenta - this.precioCosto).toFixed(2));
});

productSchema.virtual("margenPorcentaje").get(function margenPorcentaje() {
  if (!this.precioVenta) return 0;
  return Number((((this.precioVenta - this.precioCosto) / this.precioVenta) * 100).toFixed(2));
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ nombre: "text", codigo: "text" });

module.exports = mongoose.model("Product", productSchema);
