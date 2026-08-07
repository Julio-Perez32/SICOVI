// Los empleados pueden ver qué hay y a qué precio se vende, pero nunca el
// costo ni el margen de ganancia: eso es información solo para el admin.
const CAMPOS_OCULTOS_EMPLEADO = ["precioCosto", "margen", "margenPorcentaje"];

function sanitizeProduct(product, rol) {
  const obj = typeof product.toObject === "function" ? product.toObject() : product;

  if (rol === "admin") return obj;

  const copia = { ...obj };
  CAMPOS_OCULTOS_EMPLEADO.forEach((campo) => delete copia[campo]);
  return copia;
}

function sanitizeProducts(products, rol) {
  return products.map((p) => sanitizeProduct(p, rol));
}

module.exports = { sanitizeProduct, sanitizeProducts };
