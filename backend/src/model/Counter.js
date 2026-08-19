const mongoose = require("mongoose");

// Contador atómico para números correlativos (ej. el N° de comprobante de
// las ventas). Se usa con findOneAndUpdate + $inc, que en Mongo es atómico:
// aunque dos ventas se registren al mismo tiempo, cada una se lleva un
// número distinto.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // nombre de la secuencia, ej. "comprobante"
  valor: { type: Number, default: 0 },
});

// Devuelve el siguiente número de la secuencia. Si se le pasa una sesión de
// transacción, participa de esa misma transacción.
counterSchema.statics.siguiente = async function siguiente(nombre, session) {
  const opciones = { new: true, upsert: true };
  if (session) opciones.session = session;

  const doc = await this.findByIdAndUpdate(nombre, { $inc: { valor: 1 } }, opciones);
  return doc.valor;
};

module.exports = mongoose.model("Counter", counterSchema);
