const { Notification, User } = require("../model");
const sendEmail = require("./sendEmail");

// Se llama después de guardar cualquier cambio de stock sobre un producto
// (venta, anulación, compra, ajuste). Decide si hay que:
//  - crear una alerta nueva (stock bajo / sin stock) y avisar a los admins
//  - o limpiar la alerta si el producto ya se volvió a abastecer
// La bandera product.alertaActiva evita mandar el mismo correo una y otra vez
// mientras el stock siga bajo: solo se dispara al cruzar el umbral hacia abajo.
async function evaluarAlertaStock(product) {
  const bajoMinimo = product.stock <= product.stockMinimo;

  if (bajoMinimo && !product.alertaActiva) {
    const tipo = product.stock <= 0 ? "sin_stock" : "stock_bajo";
    const mensaje =
      tipo === "sin_stock"
        ? `El producto "${product.nombre}" (${product.codigo}) se quedó sin stock.`
        : `El producto "${product.nombre}" (${product.codigo}) tiene stock bajo: quedan ${product.stock} unidades (mínimo: ${product.stockMinimo}).`;

    await Notification.create({ producto: product._id, tipo, mensaje });

    product.alertaActiva = true;
    await product.save();

    const admins = await User.find({ rol: "admin", activo: true }).select("email");
    if (admins.length) {
      await sendEmail({
        to: admins.map((a) => a.email).join(","),
        subject: `SICOVI - ${tipo === "sin_stock" ? "Producto sin stock" : "Stock bajo"}: ${product.nombre}`,
        html: `<p>${mensaje}</p><p>Código: ${product.codigo}</p>`,
      });
    }
  } else if (!bajoMinimo && product.alertaActiva) {
    // El producto se re-abasteció por encima del mínimo: se apaga la bandera
    // para que la próxima vez que baje del umbral vuelva a avisar.
    product.alertaActiva = false;
    await product.save();
  }
}

module.exports = evaluarAlertaStock;
