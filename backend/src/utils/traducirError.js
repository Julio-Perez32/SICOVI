// Traduce los errores crudos de Mongoose/MongoDB a mensajes que el usuario
// pueda entender. Sin esto, cambiarle el código a un producto por uno que ya
// existe devolvía cosas como:
//   "E11000 duplicate key error collection: SICOVI.products index: codigo_1"
// que no le dice nada a quien está usando el sistema.

// Nombre "de pantalla" de cada campo, para no mostrar el nombre técnico.
const ETIQUETAS_CAMPO = {
  codigo: "código",
  email: "correo",
  username: "usuario",
  nombre: "nombre",
  numeroComprobante: "número de comprobante",
  precio: "precio",
  precioVenta: "precio de venta",
  precioCosto: "precio de costo",
  stock: "stock",
  stockMinimo: "stock mínimo",
  cantidad: "cantidad",
  duracionMinutos: "duración",
  password: "contraseña",
  rol: "rol",
  telefono: "teléfono",
  metodoPago: "método de pago",
};

// Las entidades femeninas necesitan "otra" en vez de "otro".
const ENTIDADES_FEMENINAS = new Set(["categoría", "venta", "compra", "alerta", "notificación"]);

const etiquetaDe = (campo) => ETIQUETAS_CAMPO[campo] || campo;

function traducirError(error, entidad = "registro") {
  // --- Clave duplicada (índice único) ---
  if (error.code === 11000) {
    const campo = Object.keys(error.keyValue || {})[0];
    const valor = campo ? error.keyValue[campo] : null;
    const otro = ENTIDADES_FEMENINAS.has(entidad) ? "otra" : "otro";

    return {
      status: 409,
      message: campo
        ? `Ya existe ${otro} ${entidad} con el ${etiquetaDe(campo)} "${valor}". Usa uno diferente.`
        : `Ya existe ${otro} ${entidad} con esos datos.`,
    };
  }

  // --- Validaciones del esquema (required, min, enum, etc.) ---
  if (error.name === "ValidationError") {
    const detalles = Object.values(error.errors).map((e) => {
      const campo = etiquetaDe(e.path);
      // Los mensajes propios del esquema ya están en español; los que trae
      // Mongoose por defecto (min/max/enum/minlength) se reescriben aquí.
      if (e.kind === "min") return `El ${campo} no puede ser menor que ${e.properties.min}.`;
      if (e.kind === "max") return `El ${campo} no puede ser mayor que ${e.properties.max}.`;
      if (e.kind === "enum") return `"${e.value}" no es un valor válido para el ${campo}.`;
      if (e.kind === "minlength") return `El ${campo} debe tener al menos ${e.properties.minlength} caracteres.`;
      if (e.kind === "required") return e.message || `El ${campo} es obligatorio.`;
      return e.message;
    });

    // Se asegura el punto final para que dos mensajes seguidos no se peguen.
    const conPunto = detalles.map((d) => (/[.!?]$/.test(d) ? d : d + "."));
    return { status: 400, message: conPunto.join(" "), errors: conPunto };
  }

  // --- Id con formato inválido ---
  if (error.name === "CastError") {
    if (error.kind === "ObjectId") {
      return { status: 400, message: `No se encontró el ${entidad}: el identificador no es válido.` };
    }
    return { status: 400, message: `El ${etiquetaDe(error.path)} tiene un valor inválido.` };
  }

  return { status: 400, message: error.message || "Ocurrió un error inesperado." };
}

// Atajo para responder directamente desde el catch de un controller.
function responderError(res, error, entidad) {
  const { status, message, errors } = traducirError(error, entidad);
  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });
}

module.exports = { traducirError, responderError };
