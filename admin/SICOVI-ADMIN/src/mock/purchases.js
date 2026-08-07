// Datos de ejemplo -- misma forma que devuelve GET /api/purchases
export const purchases = [
  {
    _id: 'purch-1',
    proveedor: { _id: 'sup-1', nombre: 'SIGLO 2000, S.A. DE C.V.' },
    numeroDocumento: 'CFDTE0226 - 001544',
    fecha: '2026-07-31T11:36:21.000Z',
    registradoPor: { _id: 'user-1', nombre: 'Administrador SICOVI' },
    items: [
      { codigo: 'VAL025', descripcion: 'Pachón Valvoline Full Premium 10W30', cantidad: 3, precioUnitario: 37.17, subtotal: 111.5 },
      { codigo: 'VAL026', descripcion: '1/4 Valvoline Full Sint. Premium 10W30', cantidad: 2, precioUnitario: 8.85, subtotal: 17.7 },
      { codigo: 'MOB026', descripcion: 'Galón Mobil Refrigerante Permazone 50/50', cantidad: 6, precioUnitario: 9.73, subtotal: 58.41 },
    ],
    subtotal: 1079.64,
    total: 1219.99,
  },
  {
    _id: 'purch-2',
    proveedor: { _id: 'sup-2', nombre: 'Distribuidora Frenos y Más, S.A. de C.V.' },
    numeroDocumento: 'FAC-00891',
    fecha: '2026-08-02T09:10:00.000Z',
    registradoPor: { _id: 'user-1', nombre: 'Administrador SICOVI' },
    items: [
      { codigo: 'FRN-201', descripcion: 'Juego de pastillas de freno delanteras', cantidad: 10, precioUnitario: 18.4, subtotal: 184.0 },
      { codigo: 'FRN-330', descripcion: 'Disco de freno ventilado 15"', cantidad: 6, precioUnitario: 32.0, subtotal: 192.0 },
    ],
    subtotal: 376.0,
    total: 424.88,
  },
  {
    _id: 'purch-3',
    proveedor: { _id: 'sup-3', nombre: 'Baterías El Salvador, S.A. de C.V.' },
    numeroDocumento: 'FAC-04512',
    fecha: '2026-08-05T15:40:00.000Z',
    registradoPor: { _id: 'user-1', nombre: 'Administrador SICOVI' },
    items: [{ codigo: 'BAT-650', descripcion: 'Batería 12V 650 CCA', cantidad: 8, precioUnitario: 62.0, subtotal: 496.0 }],
    subtotal: 496.0,
    total: 560.48,
  },
]
