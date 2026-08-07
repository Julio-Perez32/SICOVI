// Datos de ejemplo -- misma forma que devuelve GET /api/notifications
export const notifications = [
  {
    _id: 'notif-1',
    producto: { _id: 'prod-7', codigo: 'PH6607', nombre: 'Filtro de aceite IRSA PH6607 L266 / PH2876', stock: 0, stockMinimo: 10 },
    tipo: 'sin_stock',
    mensaje: 'El producto "Filtro de aceite IRSA PH6607 L266 / PH2876" (PH6607) se quedó sin stock.',
    leida: false,
    createdAt: '2026-08-07T08:05:00.000Z',
  },
  {
    _id: 'notif-2',
    producto: { _id: 'prod-6', codigo: 'OS104', nombre: 'Filtro Senfineco OS104 eq. PH2867, PH7317', stock: 2, stockMinimo: 10 },
    tipo: 'stock_bajo',
    mensaje: 'El producto "Filtro Senfineco OS104 eq. PH2867, PH7317" (OS104) tiene stock bajo: quedan 2 unidades (mínimo: 10).',
    leida: false,
    createdAt: '2026-08-07T08:05:00.000Z',
  },
  {
    _id: 'notif-3',
    producto: { _id: 'prod-2', codigo: 'VAL026', nombre: '1/4 Valvoline Full Sint. Premium 10W30', stock: 3, stockMinimo: 6 },
    tipo: 'stock_bajo',
    mensaje: '1/4 Valvoline Full Sint. Premium 10W30 (VAL026) tiene stock bajo: quedan 3 unidades (mínimo: 6).',
    leida: true,
    createdAt: '2026-08-06T17:30:00.000Z',
  },
]
