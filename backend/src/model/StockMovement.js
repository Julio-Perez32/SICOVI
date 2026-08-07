const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    tipo: {
      type: String,
      enum: ["entrada", "salida", "ajuste"],
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
    },
    stockResultante: {
      type: Number,
      required: true,
    },
    referenciaTipo: {
      type: String,
      enum: ["Purchase", "Sale", "Ajuste"],
      default: null,
    },
    referencia: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    motivo: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

stockMovementSchema.index({ producto: 1, createdAt: -1 });

module.exports = mongoose.model("StockMovement", stockMovementSchema);
