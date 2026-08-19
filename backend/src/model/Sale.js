const mongoose = require("mongoose");

// Una línea de la venta puede ser un producto (baja stock) o un servicio
// de mano de obra (no toca inventario). Los datos de nombre/código/precios
// se guardan congelados en la línea, así el histórico no se distorsiona si
// después cambian en el catálogo.
const saleItemSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["producto", "servicio"],
      default: "producto",
    },
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    servicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      default: null,
    },
    codigo: { type: String, trim: true, uppercase: true },
    nombre: { type: String, trim: true },
    cantidad: { type: Number, required: true, min: 0.01 },
    precioVentaUnitario: { type: Number, required: true, min: 0 },
    precioCostoUnitario: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    numeroComprobante: {
      type: String,
      trim: true,
      index: true,
    },
    vendedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    cliente: {
      type: String,
      trim: true,
    },
    // Vehículo al que se le hizo el trabajo -- va en la orden de servicio.
    vehiculo: {
      type: String,
      trim: true,
    },
    metodoPago: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia", "otro"],
      default: "efectivo",
    },
    items: {
      type: [saleItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "La venta debe tener al menos un producto o servicio",
      },
    },
    total: { type: Number, required: true, min: 0 },
    anulada: { type: Boolean, default: false },
    anuladaPor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    anuladaEn: { type: Date, default: null },
    motivoAnulacion: { type: String, trim: true },
  },
  { timestamps: true }
);

// Ganancia total de la venta (no persistida, calculada al vuelo)
saleSchema.virtual("gananciaTotal").get(function gananciaTotal() {
  return Number(
    this.items
      .reduce((acc, it) => acc + (it.precioVentaUnitario - it.precioCostoUnitario) * it.cantidad, 0)
      .toFixed(2)
  );
});

saleSchema.set("toJSON", { virtuals: true });
saleSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Sale", saleSchema);
