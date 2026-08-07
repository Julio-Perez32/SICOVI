// Datos de ejemplo -- misma forma que devuelve GET /api/sales para el rol
// "empleado" (todas se hicieron desde la cuenta compartida, ver
// mock/session.js).
export const mySales = [
  {
    _id: 'sale-1',
    cliente: 'Oscar Meléndez',
    metodoPago: 'efectivo',
    fecha: '2026-08-07T09:20:00.000Z',
    items: [
      { codigo: 'VAL025', nombre: 'Pachón Valvoline Full Premium 10W30', cantidad: 2, precioVentaUnitario: 46.5, subtotal: 93.0 },
      { codigo: 'PH4967S', nombre: 'Filtro IRSA PH4967S PH2840 / L4', cantidad: 1, precioVentaUnitario: 3.5, subtotal: 3.5 },
    ],
    total: 96.5,
    anulada: false,
  },
  {
    _id: 'sale-3',
    cliente: 'Taller Rivas',
    metodoPago: 'transferencia',
    fecha: '2026-08-07T13:40:00.000Z',
    items: [
      { codigo: 'FRN-201', nombre: 'Juego de pastillas de freno delanteras', cantidad: 2, precioVentaUnitario: 28.0, subtotal: 56.0 },
      { codigo: 'FRN-330', nombre: 'Disco de freno ventilado 15"', cantidad: 2, precioVentaUnitario: 47.5, subtotal: 95.0 },
    ],
    total: 151.0,
    anulada: false,
  },
  {
    _id: 'sale-5',
    cliente: 'Consumidor final',
    metodoPago: 'efectivo',
    fecha: '2026-08-05T13:50:00.000Z',
    items: [
      { codigo: 'VAL009', nombre: 'Pachón 5/4 Maxlife 10W30', cantidad: 1, precioVentaUnitario: 36.0, subtotal: 36.0 },
      { codigo: 'OS104', nombre: 'Filtro Senfineco OS104 eq. PH2867, PH7317', cantidad: 1, precioVentaUnitario: 3.5, subtotal: 3.5 },
    ],
    total: 39.5,
    anulada: false,
  },
  {
    _id: 'sale-6',
    cliente: 'Consumidor final',
    metodoPago: 'tarjeta',
    fecha: '2026-08-04T11:10:00.000Z',
    items: [{ codigo: 'BAT-650', nombre: 'Batería 12V 650 CCA', cantidad: 1, precioVentaUnitario: 89.99, subtotal: 89.99 }],
    total: 89.99,
    anulada: false,
  },
]

// Estadística rápida ya calculada (así se vería /api/dashboard-lite del
// empleado si existiera -- por ahora es un cálculo fijo de ejemplo, sin
// costo ni margen).
export const myStats = {
  hoy: { cantidad: 2, total: 247.5 },
  semana: { cantidad: 4, total: 377.0 },
}
