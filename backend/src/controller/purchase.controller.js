const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const { Purchase, Product, StockMovement } = require("../model");
const evaluarAlertaStock = require("../utils/stockAlert");

const purchaseController = {};

// POST /api/purchases (admin)
// body: { proveedor, numeroDocumento, fecha, notas,
//         items: [{ productoId?, codigo, descripcion, cantidad, precioUnitario,
//                    unidadMedida?, precioVenta?, categoria?, stockMinimo? }] }
//
// Si "productoId" no viene y no existe un producto con ese "codigo", se crea
// el producto de una vez (igual que al recibir una factura de proveedor con
// varias líneas nuevas). En ese caso "precioVenta" es obligatorio.
purchaseController.createPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { proveedor, numeroDocumento, fecha, notas, items } = req.body;

    if (!proveedor) throw new ApiError(400, "La compra debe indicar un proveedor");
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "La compra debe tener al menos un producto");
    }

    let purchase;
    const productosAfectados = [];

    await session.withTransaction(async () => {
      const itemsProcesados = [];
      let subtotal = 0;

      for (const item of items) {
        if (!item.cantidad || item.cantidad <= 0) {
          throw new ApiError(400, `Cantidad inválida para el producto ${item.codigo || item.productoId}`);
        }
        if (item.precioUnitario === undefined || item.precioUnitario < 0) {
          throw new ApiError(400, `Precio unitario inválido para el producto ${item.codigo || item.productoId}`);
        }

        let producto = item.productoId
          ? await Product.findById(item.productoId).session(session)
          : await Product.findOne({ codigo: (item.codigo || "").toUpperCase() }).session(session);

        if (!producto) {
          if (!item.codigo || !item.descripcion) {
            throw new ApiError(400, "Para crear un producto nuevo se necesita código y descripción");
          }
          if (item.precioVenta === undefined) {
            throw new ApiError(400, `Falta precioVenta para crear el producto nuevo ${item.codigo}`);
          }

          const nuevo = await Product.create(
            [
              {
                codigo: item.codigo,
                nombre: item.descripcion,
                unidadMedida: item.unidadMedida || "UNIDAD",
                categoria: item.categoria || null,
                proveedor,
                precioCosto: item.precioUnitario,
                precioVenta: item.precioVenta,
                stock: 0,
                stockMinimo: item.stockMinimo,
              },
            ],
            { session }
          );
          producto = nuevo[0];
        }

        const cantidad = Number(item.cantidad);
        const precioUnitario = Number(item.precioUnitario);
        const subtotalItem = Number((cantidad * precioUnitario).toFixed(2));

        producto.stock += cantidad;
        producto.precioCosto = precioUnitario;
        await producto.save({ session });

        await StockMovement.create(
          [
            {
              producto: producto._id,
              tipo: "entrada",
              cantidad,
              stockResultante: producto.stock,
              referenciaTipo: "Purchase",
              usuario: req.user._id,
              motivo: "Compra a proveedor",
            },
          ],
          { session }
        );

        itemsProcesados.push({
          producto: producto._id,
          codigo: producto.codigo,
          descripcion: item.descripcion || producto.nombre,
          cantidad,
          precioUnitario,
          subtotal: subtotalItem,
        });
        subtotal += subtotalItem;
        productosAfectados.push(producto._id);
      }

      subtotal = Number(subtotal.toFixed(2));

      const creada = await Purchase.create(
        [
          {
            proveedor,
            numeroDocumento,
            fecha: fecha || Date.now(),
            registradoPor: req.user._id,
            items: itemsProcesados,
            subtotal,
            total: subtotal,
            notas,
          },
        ],
        { session }
      );
      purchase = creada[0];

      // La referencia de cada movimiento se guarda una vez que ya existe el id de la compra
      await StockMovement.updateMany(
        { referenciaTipo: "Purchase", referencia: null, producto: { $in: productosAfectados } },
        { $set: { referencia: purchase._id } },
        { session }
      );
    });

    // Fuera de la transacción: revisar/actualizar alertas de stock bajo por si
    // la compra hizo que un producto volviera a tener stock suficiente.
    for (const productoId of productosAfectados) {
      const producto = await Product.findById(productoId);
      if (producto) await evaluarAlertaStock(producto);
    }

    const purchasePopulada = await Purchase.findById(purchase._id).populate("proveedor", "nombre");
    res.status(201).json({ success: true, compra: purchasePopulada });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message });
  } finally {
    await session.endSession();
  }
};

// GET /api/purchases (admin)
purchaseController.getPurchases = async (req, res) => {
  try {
    const compras = await Purchase.find()
      .populate("proveedor", "nombre")
      .populate("registradoPor", "nombre")
      .sort({ fecha: -1 });

    res.status(200).json({ success: true, count: compras.length, compras });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/purchases/:id (admin)
purchaseController.getPurchase = async (req, res) => {
  try {
    const compra = await Purchase.findById(req.params.id)
      .populate("proveedor")
      .populate("registradoPor", "nombre")
      .populate("items.producto", "codigo nombre");

    if (!compra) return res.status(404).json({ success: false, message: "Compra no encontrada" });
    res.status(200).json({ success: true, compra });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = purchaseController;
