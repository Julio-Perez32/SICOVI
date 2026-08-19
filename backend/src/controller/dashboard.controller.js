const { Product, Sale, StockMovement, Notification } = require("../model");

const dashboardController = {};

function inicioDelDia(offsetDias = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offsetDias);
  return d;
}

function inicioDelMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const sumaGananciaItems = {
  $reduce: {
    input: "$items",
    initialValue: 0,
    in: {
      $add: [
        "$$value",
        {
          $multiply: [
            { $subtract: ["$$this.precioVentaUnitario", "$$this.precioCostoUnitario"] },
            "$$this.cantidad",
          ],
        },
      ],
    },
  },
};

// GET /api/dashboard/summary (admin)
// KPIs generales: valor de inventario (costo vs venta), ganancia potencial,
// ventas de hoy/del mes y estado de las alertas de stock.
dashboardController.getSummary = async (req, res) => {
  try {
    const [inventario, ventasHoy, ventasMes, productosStockBajo, productosSinStock, alertasSinLeer] =
      await Promise.all([
        Product.aggregate([
          { $match: { activo: true } },
          {
            $group: {
              _id: null,
              totalProductos: { $sum: 1 },
              unidadesEnStock: { $sum: "$stock" },
              valorInventarioCosto: { $sum: { $multiply: ["$stock", "$precioCosto"] } },
              valorInventarioVenta: { $sum: { $multiply: ["$stock", "$precioVenta"] } },
            },
          },
        ]),
        Sale.aggregate([
          { $match: { anulada: false, fecha: { $gte: inicioDelDia(0) } } },
          { $group: { _id: null, cantidad: { $sum: 1 }, total: { $sum: "$total" }, ganancia: { $sum: sumaGananciaItems } } },
        ]),
        Sale.aggregate([
          { $match: { anulada: false, fecha: { $gte: inicioDelMes() } } },
          { $group: { _id: null, cantidad: { $sum: 1 }, total: { $sum: "$total" }, ganancia: { $sum: sumaGananciaItems } } },
        ]),
        Product.countDocuments({
          activo: true,
          $expr: { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", "$stockMinimo"] }] },
        }),
        Product.countDocuments({ activo: true, stock: { $lte: 0 } }),
        Notification.countDocuments({ leida: false }),
      ]);

    const inv = inventario[0] || {
      totalProductos: 0,
      unidadesEnStock: 0,
      valorInventarioCosto: 0,
      valorInventarioVenta: 0,
    };
    const hoy = ventasHoy[0] || { cantidad: 0, total: 0, ganancia: 0 };
    const mes = ventasMes[0] || { cantidad: 0, total: 0, ganancia: 0 };

    res.status(200).json({
      success: true,
      resumen: {
        totalProductos: inv.totalProductos,
        unidadesEnStock: inv.unidadesEnStock,
        valorInventarioCosto: Number(inv.valorInventarioCosto.toFixed(2)),
        valorInventarioVenta: Number(inv.valorInventarioVenta.toFixed(2)),
        gananciaPotencialInventario: Number((inv.valorInventarioVenta - inv.valorInventarioCosto).toFixed(2)),
        ventasHoy: { cantidad: hoy.cantidad, total: Number(hoy.total.toFixed(2)), ganancia: Number(hoy.ganancia.toFixed(2)) },
        ventasMes: { cantidad: mes.cantidad, total: Number(mes.total.toFixed(2)), ganancia: Number(mes.ganancia.toFixed(2)) },
        productosStockBajo,
        productosSinStock,
        alertasSinLeer,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/sales-timeseries?range=7d|30d (admin)
dashboardController.getSalesTimeseries = async (req, res) => {
  try {
    const dias = req.query.range === "30d" ? 30 : 7;
    const desde = inicioDelDia(dias - 1);

    const serie = await Sale.aggregate([
      { $match: { anulada: false, fecha: { $gte: desde } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$fecha" } },
          totalVentas: { $sum: "$total" },
          cantidadVentas: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Se rellenan los días sin ventas con 0 para que el gráfico no tenga huecos
    const mapa = new Map(serie.map((d) => [d._id, d]));
    const resultado = [];
    for (let i = dias - 1; i >= 0; i -= 1) {
      const fecha = inicioDelDia(i).toISOString().slice(0, 10);
      const datoDia = mapa.get(fecha);
      resultado.push({
        fecha,
        totalVentas: Number((datoDia?.totalVentas || 0).toFixed(2)),
        cantidadVentas: datoDia?.cantidadVentas || 0,
      });
    }

    res.status(200).json({ success: true, serie: resultado });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/top-products?limit=10 (admin)
dashboardController.getTopProducts = async (req, res) => {
  try {
    const limite = Math.min(Number(req.query.limit) || 10, 50);

    const top = await Sale.aggregate([
      { $match: { anulada: false } },
      { $unwind: "$items" },
      // Solo líneas de producto: los servicios no tienen "producto" y se
      // agruparían todos juntos bajo null, ensuciando el ranking.
      { $match: { "items.producto": { $ne: null } } },
      {
        $group: {
          _id: "$items.producto",
          codigo: { $first: "$items.codigo" },
          nombre: { $first: "$items.nombre" },
          unidadesVendidas: { $sum: "$items.cantidad" },
          totalVendido: { $sum: "$items.subtotal" },
          gananciaGenerada: {
            $sum: {
              $multiply: [
                { $subtract: ["$items.precioVentaUnitario", "$items.precioCostoUnitario"] },
                "$items.cantidad",
              ],
            },
          },
        },
      },
      { $sort: { unidadesVendidas: -1 } },
      { $limit: limite },
    ]);

    res.status(200).json({ success: true, productos: top });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/margin-by-category (admin)
dashboardController.getMarginByCategory = async (req, res) => {
  try {
    const datos = await Product.aggregate([
      { $match: { activo: true } },
      { $lookup: { from: "categories", localField: "categoria", foreignField: "_id", as: "categoriaInfo" } },
      {
        $group: {
          _id: "$categoria",
          categoria: { $first: { $ifNull: [{ $arrayElemAt: ["$categoriaInfo.nombre", 0] }, "Sin categoría"] } },
          valorCosto: { $sum: { $multiply: ["$stock", "$precioCosto"] } },
          valorVenta: { $sum: { $multiply: ["$stock", "$precioVenta"] } },
          productos: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          categoria: 1,
          productos: 1,
          valorCosto: { $round: ["$valorCosto", 2] },
          valorVenta: { $round: ["$valorVenta", 2] },
          margen: { $round: [{ $subtract: ["$valorVenta", "$valorCosto"] }, 2] },
        },
      },
      { $sort: { valorVenta: -1 } },
    ]);

    res.status(200).json({ success: true, categorias: datos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/sales-by-employee (admin)
dashboardController.getSalesByEmployee = async (req, res) => {
  try {
    const datos = await Sale.aggregate([
      { $match: { anulada: false } },
      { $lookup: { from: "users", localField: "vendedor", foreignField: "_id", as: "vendedorInfo" } },
      {
        $group: {
          _id: "$vendedor",
          vendedor: { $first: { $arrayElemAt: ["$vendedorInfo.nombre", 0] } },
          cantidadVentas: { $sum: 1 },
          totalVendido: { $sum: "$total" },
        },
      },
      { $sort: { totalVendido: -1 } },
    ]);

    res.status(200).json({ success: true, vendedores: datos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/sales-by-payment-method (admin)
dashboardController.getSalesByPaymentMethod = async (req, res) => {
  try {
    const datos = await Sale.aggregate([
      { $match: { anulada: false } },
      {
        $group: {
          _id: "$metodoPago",
          cantidadVentas: { $sum: 1 },
          totalVendido: { $sum: "$total" },
        },
      },
      { $sort: { totalVendido: -1 } },
    ]);

    const ETIQUETAS = { efectivo: "Efectivo", tarjeta: "Tarjeta", transferencia: "Transferencia", otro: "Otro" };
    const metodos = datos.map((d) => ({
      metodo: ETIQUETAS[d._id] || d._id,
      cantidadVentas: d.cantidadVentas,
      totalVendido: d.totalVendido,
    }));

    res.status(200).json({ success: true, metodos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/recent-activity?limit=20 (admin)
dashboardController.getRecentActivity = async (req, res) => {
  try {
    const limite = Math.min(Number(req.query.limit) || 20, 100);

    const movimientos = await StockMovement.find()
      .populate("producto", "codigo nombre")
      .populate("usuario", "nombre")
      .sort({ createdAt: -1 })
      .limit(limite);

    res.status(200).json({ success: true, movimientos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = dashboardController;
