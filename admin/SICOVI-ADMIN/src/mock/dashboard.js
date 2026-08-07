// Datos de ejemplo -- misma forma que devuelven los endpoints /api/dashboard/*
export const summary = {
  totalProductos: 12,
  unidadesEnStock: 110,
  valorInventarioCosto: 4218.35,
  valorInventarioVenta: 5896.4,
  gananciaPotencialInventario: 1678.05,
  ventasHoy: { cantidad: 2, total: 186.49, ganancia: 46.51 },
  ventasMes: { cantidad: 5, total: 649.0, ganancia: 168.35 },
  productosStockBajo: 2,
  productosSinStock: 1,
  alertasSinLeer: 2,
}

export const salesTimeseries = [
  { fecha: '2026-08-01', totalVentas: 210.4, cantidadVentas: 4 },
  { fecha: '2026-08-02', totalVentas: 95.2, cantidadVentas: 2 },
  { fecha: '2026-08-03', totalVentas: 340.75, cantidadVentas: 6 },
  { fecha: '2026-08-04', totalVentas: 120.0, cantidadVentas: 3 },
  { fecha: '2026-08-05', totalVentas: 39.5, cantidadVentas: 1 },
  { fecha: '2026-08-06', totalVentas: 151.0, cantidadVentas: 2 },
  { fecha: '2026-08-07', totalVentas: 186.49, cantidadVentas: 2 },
]

export const topProducts = [
  { codigo: 'VAL025', nombre: 'Pachón Valvoline Full Premium 10W30', unidadesVendidas: 14, totalVendido: 651.0 },
  { codigo: 'BAT-650', nombre: 'Batería 12V 650 CCA', unidadesVendidas: 5, totalVendido: 449.95 },
  { codigo: 'LLT-R15', nombre: 'Llanta 185/65 R15', unidadesVendidas: 8, totalVendido: 544.0 },
  { codigo: 'FRN-330', nombre: 'Disco de freno ventilado 15"', unidadesVendidas: 6, totalVendido: 285.0 },
  { codigo: 'FRN-201', nombre: 'Juego de pastillas de freno delanteras', unidadesVendidas: 7, totalVendido: 196.0 },
]

export const marginByCategory = [
  { categoria: 'Baterías', productos: 1, valorCosto: 434.0, valorVenta: 629.93, margen: 195.93 },
  { categoria: 'Llantas', productos: 1, valorCosto: 450.0, valorVenta: 680.0, margen: 230.0 },
  { categoria: 'Frenos', productos: 2, valorCosto: 238.4, valorVenta: 358.0, margen: 119.6 },
  { categoria: 'Lubricantes', productos: 5, valorCosto: 1874.85, valorVenta: 2400.75, margen: 525.9 },
  { categoria: 'Filtros', productos: 3, valorCosto: 33.83, valorVenta: 59.5, margen: 25.67 },
]

export const salesByEmployee = [
  { vendedor: 'Antonhy Campos', cantidadVentas: 3, totalVendido: 286.5 },
  { vendedor: 'Karla Ramírez', cantidadVentas: 2, totalVendido: 361.99 },
]

export const recentActivity = [
  { _id: 'mov-1', producto: { codigo: 'VAL025', nombre: 'Pachón Valvoline Full Premium 10W30' }, tipo: 'salida', cantidad: -2, stockResultante: 18, usuario: { nombre: 'Antonhy Campos' }, motivo: 'Venta', createdAt: '2026-08-07T09:20:00.000Z' },
  { _id: 'mov-2', producto: { codigo: 'BAT-650', nombre: 'Batería 12V 650 CCA' }, tipo: 'salida', cantidad: -1, stockResultante: 7, usuario: { nombre: 'Karla Ramírez' }, motivo: 'Venta', createdAt: '2026-08-07T11:05:00.000Z' },
  { _id: 'mov-3', producto: { codigo: 'BAT-650', nombre: 'Batería 12V 650 CCA' }, tipo: 'entrada', cantidad: 8, stockResultante: 15, usuario: { nombre: 'Administrador SICOVI' }, motivo: 'Compra a proveedor', createdAt: '2026-08-05T15:40:00.000Z' },
  { _id: 'mov-4', producto: { codigo: 'LLT-R15', nombre: 'Llanta 185/65 R15' }, tipo: 'entrada', cantidad: 4, stockResultante: 10, usuario: { nombre: 'Administrador SICOVI' }, motivo: 'Anulación de venta', createdAt: '2026-08-06T18:00:00.000Z' },
  { _id: 'mov-5', producto: { codigo: 'PH6607', nombre: 'Filtro de aceite IRSA PH6607 L266 / PH2876' }, tipo: 'salida', cantidad: -3, stockResultante: 0, usuario: { nombre: 'Karla Ramírez' }, motivo: 'Venta', createdAt: '2026-08-07T08:05:00.000Z' },
]
