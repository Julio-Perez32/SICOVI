const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const { Sale, Product, Service, StockMovement, Counter } = require("../model");
const evaluarAlertaStock = require("../utils/stockAlert");

const saleController = {};

// POST /api/sales (admin o empleado)
// body: { cliente?, vehiculo?, metodoPago?, items: [...] }
// Cada línea puede ser un producto o un servicio:
//   { tipo: "producto", productoId, cantidad }
//   { tipo: "servicio", servicioId, cantidad }
// Los precios (y el costo, para el margen histórico) se toman del catálogo
// en este momento, nunca del body, para que no se puedan alterar desde el
// cliente. Los servicios son mano de obra: no tienen costo de inventario
// ni descuentan stock.
saleController.createSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { cliente, vehiculo, metodoPago, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "La venta debe tener al menos un producto o servicio");
    }

    let sale;
    const productosAfectados = [];

    await session.withTransaction(async () => {
      const itemsProcesados = [];
      let total = 0;

      for (const item of items) {
        const esServicio = item.tipo === "servicio" || (!item.productoId && item.servicioId);

        if (!item.cantidad || item.cantidad <= 0) {
          throw new ApiError(400, "Cada línea necesita una cantidad válida");
        }
        const cantidad = Number(item.cantidad);

        if (esServicio) {
          if (!item.servicioId) {
            throw new ApiError(400, "Cada línea de servicio necesita servicioId");
          }

          const servicio = await Service.findById(item.servicioId).session(session);
          if (!servicio || !servicio.activo) {
            throw new ApiError(404, `Servicio no encontrado: ${item.servicioId}`);
          }

          const subtotalItem = Number((cantidad * servicio.precio).toFixed(2));

          itemsProcesados.push({
            tipo: "servicio",
            servicio: servicio._id,
            codigo: servicio.codigo,
            nombre: servicio.nombre,
            cantidad,
            precioVentaUnitario: servicio.precio,
            precioCostoUnitario: 0, // mano de obra: sin costo de inventario
            subtotal: subtotalItem,
          });
          total += subtotalItem;
          continue;
        }

        if (!item.productoId) {
          throw new ApiError(400, "Cada línea de producto necesita productoId");
        }

        const producto = await Product.findById(item.productoId).session(session);
        if (!producto || !producto.activo) {
          throw new ApiError(404, `Producto no encontrado: ${item.productoId}`);
        }

        if (producto.stock < cantidad) {
          throw new ApiError(
            400,
            `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock}, solicitado: ${cantidad})`
          );
        }

        const subtotalItem = Number((cantidad * producto.precioVenta).toFixed(2));

        producto.stock -= cantidad;
        await producto.save({ session });

        await StockMovement.create(
          [
            {
              producto: producto._id,
              tipo: "salida",
              cantidad: -cantidad,
              stockResultante: producto.stock,
              referenciaTipo: "Sale",
              usuario: req.user._id,
              motivo: "Venta",
            },
          ],
          { session }
        );

        itemsProcesados.push({
          tipo: "producto",
          producto: producto._id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          cantidad,
          precioVentaUnitario: producto.precioVenta,
          precioCostoUnitario: producto.precioCosto,
          subtotal: subtotalItem,
        });
        total += subtotalItem;
        productosAfectados.push(producto._id);
      }

      // Correlativo del comprobante (atómico, dentro de la misma transacción)
      const correlativo = await Counter.siguiente("comprobante", session);
      const numeroComprobante = `OS-${String(correlativo).padStart(5, "0")}`; // OS = Orden de Servicio

      const creada = await Sale.create(
        [
          {
            numeroComprobante,
            vendedor: req.user._id,
            cliente,
            vehiculo,
            metodoPago,
            items: itemsProcesados,
            total: Number(total.toFixed(2)),
          },
        ],
        { session }
      );
      sale = creada[0];

      await StockMovement.updateMany(
        { referenciaTipo: "Sale", referencia: null, producto: { $in: productosAfectados } },
        { $set: { referencia: sale._id } },
        { session }
      );
    });

    // Fuera de la transacción: revisar si algún producto quedó en stock bajo/cero
    for (const productoId of productosAfectados) {
      const producto = await Product.findById(productoId);
      if (producto) await evaluarAlertaStock(producto);
    }

    const ventaPopulada = await Sale.findById(sale._id).populate("vendedor", "nombre");
    res.status(201).json({ success: true, venta: ventaPopulada });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

// GET /api/sales?desde=&hasta=&vendedor=
// El admin ve todas las ventas (con filtros); el empleado solo ve las suyas.
saleController.getSales = async (req, res) => {
  try {
    const filtro = {};

    if (req.user.rol === "empleado") {
      filtro.vendedor = req.user._id;
    } else if (req.query.vendedor) {
      filtro.vendedor = req.query.vendedor;
    }

    if (req.query.desde || req.query.hasta) {
      filtro.fecha = {};
      if (req.query.desde) filtro.fecha.$gte = new Date(req.query.desde);
      if (req.query.hasta) filtro.fecha.$lte = new Date(req.query.hasta);
    }

    const ventas = await Sale.find(filtro).populate("vendedor", "nombre").sort({ fecha: -1 });
    res.status(200).json({ success: true, count: ventas.length, ventas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sales/:id
saleController.getSale = async (req, res) => {
  try {
    const venta = await Sale.findById(req.params.id).populate("vendedor", "nombre");
    if (!venta) return res.status(404).json({ success: false, message: "Venta no encontrada" });

    if (req.user.rol === "empleado" && String(venta.vendedor._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "No puedes ver ventas de otro empleado" });
    }

    res.status(200).json({ success: true, venta });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/sales/:id/void (admin) - anula la venta y repone el stock
saleController.voidSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { motivo } = req.body;
    const venta = await Sale.findById(req.params.id);
    if (!venta) return res.status(404).json({ success: false, message: "Venta no encontrada" });
    if (venta.anulada) return res.status(400).json({ success: false, message: "Esta venta ya está anulada" });

    const productosAfectados = [];

    await session.withTransaction(async () => {
      for (const item of venta.items) {
        // Solo los productos devuelven stock; los servicios (mano de obra)
        // no tienen nada que reponer al inventario.
        if (item.tipo === "servicio" || !item.producto) continue;

        const producto = await Product.findById(item.producto).session(session);
        if (producto) {
          producto.stock += item.cantidad;
          await producto.save({ session });

          await StockMovement.create(
            [
              {
                producto: producto._id,
                tipo: "entrada",
                cantidad: item.cantidad,
                stockResultante: producto.stock,
                referenciaTipo: "Sale",
                referencia: venta._id,
                usuario: req.user._id,
                motivo: `Anulación de venta${motivo ? `: ${motivo}` : ""}`,
              },
            ],
            { session }
          );
          productosAfectados.push(producto._id);
        }
      }

      venta.anulada = true;
      venta.anuladaPor = req.user._id;
      venta.anuladaEn = new Date();
      venta.motivoAnulacion = motivo;
      await venta.save({ session });
    });

    for (const productoId of productosAfectados) {
      const producto = await Product.findById(productoId);
      if (producto) await evaluarAlertaStock(producto);
    }

    res.status(200).json({ success: true, message: "Venta anulada y stock repuesto", venta });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

module.exports = saleController;
