// Datos de ejemplo -- misma forma que devuelve GET /api/products para un
// usuario con rol "empleado": SIN precioCosto ni margen (el backend los
// quita vía sanitizeProduct antes de responder).
export const products = [
  { _id: 'prod-1', codigo: 'VAL025', nombre: 'Pachón Valvoline Full Premium 10W30', categoria: { nombre: 'Lubricantes' }, unidadMedida: 'UNIDAD', precioVenta: 46.5, stock: 18, stockMinimo: 5, activo: true },
  { _id: 'prod-2', codigo: 'VAL026', nombre: '1/4 Valvoline Full Sint. Premium 10W30', categoria: { nombre: 'Lubricantes' }, unidadMedida: 'UNIDAD', precioVenta: 11.5, stock: 3, stockMinimo: 6, activo: true },
  { _id: 'prod-3', codigo: 'VAL009', nombre: 'Pachón 5/4 Maxlife 10W30', categoria: { nombre: 'Lubricantes' }, unidadMedida: 'UNIDAD', precioVenta: 36.0, stock: 12, stockMinimo: 4, activo: true },
  { _id: 'prod-4', codigo: 'MOB026', nombre: 'Galón Mobil Refrigerante Permazone 50/50', categoria: { nombre: 'Lubricantes' }, unidadMedida: 'UNIDAD', precioVenta: 13.25, stock: 24, stockMinimo: 8, activo: true },
  { _id: 'prod-5', codigo: 'UNX012', nombre: 'Pachón Unix 10W30 Sintético (532)', categoria: { nombre: 'Lubricantes' }, unidadMedida: 'UNIDAD', precioVenta: 33.0, stock: 9, stockMinimo: 5, activo: true },
  { _id: 'prod-6', codigo: 'OS104', nombre: 'Filtro Senfineco OS104 eq. PH2867, PH7317', categoria: { nombre: 'Filtros' }, unidadMedida: 'UNIDAD', precioVenta: 3.5, stock: 2, stockMinimo: 10, activo: true },
  { _id: 'prod-7', codigo: 'PH6607', nombre: 'Filtro de aceite IRSA PH6607 L266 / PH2876', categoria: { nombre: 'Filtros' }, unidadMedida: 'UNIDAD', precioVenta: 3.5, stock: 0, stockMinimo: 10, activo: true },
  { _id: 'prod-8', codigo: 'PH4967S', nombre: 'Filtro IRSA PH4967S PH2840 / L4', categoria: { nombre: 'Filtros' }, unidadMedida: 'UNIDAD', precioVenta: 3.5, stock: 15, stockMinimo: 10, activo: true },
  { _id: 'prod-9', codigo: 'FRN-201', nombre: 'Juego de pastillas de freno delanteras', categoria: { nombre: 'Frenos' }, unidadMedida: 'JUEGO', precioVenta: 28.0, stock: 6, stockMinimo: 3, activo: true },
  { _id: 'prod-10', codigo: 'FRN-330', nombre: 'Disco de freno ventilado 15"', categoria: { nombre: 'Frenos' }, unidadMedida: 'UNIDAD', precioVenta: 47.5, stock: 4, stockMinimo: 4, activo: true },
  { _id: 'prod-11', codigo: 'BAT-650', nombre: 'Batería 12V 650 CCA', categoria: { nombre: 'Baterías' }, unidadMedida: 'UNIDAD', precioVenta: 89.99, stock: 7, stockMinimo: 3, activo: true },
  { _id: 'prod-12', codigo: 'LLT-R15', nombre: 'Llanta 185/65 R15', categoria: { nombre: 'Llantas' }, unidadMedida: 'UNIDAD', precioVenta: 68.0, stock: 10, stockMinimo: 4, activo: true },
]
