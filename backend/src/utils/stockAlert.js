const { Notification, User } = require("../model");
const sendEmail = require("./sendEmail");
const config = require("../../config");

// Qué tan grave está el stock de un producto en este momento.
function calcularSeveridad(product) {
  if (product.stock <= 0) return "sin_stock";
  if (product.stock <= product.stockMinimo) return "stock_bajo";
  return null; // saludable, no amerita alerta
}

// Se llama después de guardar cualquier cambio de stock sobre un producto
// (venta, anulación, compra, ajuste). Compara la severidad actual contra la
// última que se avisó (product.ultimoTipoAlerta):
//  - si es distinta (pasó de saludable a stock_bajo, de stock_bajo a
//    sin_stock, o -tras reabastecer- volvió a caer) crea una notificación
//    nueva (la que se ve en la campanita y en la página de Alertas).
//  - si es la misma severidad que la última vez, no repite el aviso.
//  - si el producto ya está saludable, limpia el estado para la próxima vez.
//
// Comparar por severidad (en vez de un simple booleano "ya avisé sí/no") es
// lo que evita este caso: producto se queda en 0 (avisa), se le agrega un
// poco de stock sin llegar al mínimo, y se vuelve a vender hasta 0 -- con
// un booleano esa segunda caída se quedaba sin avisar porque la bandera
// nunca se había apagado.
async function evaluarAlertaStock(product) {
  const severidad = calcularSeveridad(product);

  if (severidad === product.ultimoTipoAlerta) return; // nada cambió, no repetir

  if (severidad === null) {
    product.ultimoTipoAlerta = null;
    await product.save();
    return;
  }

  const mensaje =
    severidad === "sin_stock"
      ? `El producto "${product.nombre}" (${product.codigo}) se quedó sin stock.`
      : `El producto "${product.nombre}" (${product.codigo}) tiene stock bajo: quedan ${product.stock} unidades (mínimo: ${product.stockMinimo}).`;

  await Notification.create({ producto: product._id, tipo: severidad, mensaje });

  product.ultimoTipoAlerta = severidad;
  await product.save();

  // El aviso por correo es opcional: la alerta ya quedó guardada arriba, que
  // es lo que ve el admin en el sistema. Se prende con ALERTAS_POR_CORREO=true
  // en el .env (ver config.alertasPorCorreo).
  if (!config.alertasPorCorreo) return;

  const admins = await User.find({ rol: "admin", activo: true }).select("email");
  if (admins.length) {
    await sendEmail({
      to: admins.map((a) => a.email).join(","),
      subject: `SICOVI - ${severidad === "sin_stock" ? "Producto sin stock" : "Stock bajo"}: ${product.nombre}`,
      html: `<p>${mensaje}</p><p>Código: ${product.codigo}</p>`,
    });
  }
}

module.exports = evaluarAlertaStock;
