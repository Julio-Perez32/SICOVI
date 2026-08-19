const mongoose = require("mongoose");

// Servicios del taller (mano de obra): cambio de aceite, alineación, etc.
// A diferencia de los productos no llevan stock -- un servicio no "se
// acaba", se puede cobrar las veces que sea.
const serviceSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, "El código del servicio es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nombre: {
      type: String,
      required: [true, "El nombre del servicio es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    precio: {
      type: Number,
      required: [true, "El precio del servicio es obligatorio"],
      min: 0,
      default: 0,
    },
    duracionMinutos: {
      type: Number,
      min: 0,
      default: null,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
