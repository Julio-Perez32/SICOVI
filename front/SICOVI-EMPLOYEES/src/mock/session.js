// Identidad de ejemplo de la sesión "empleado" -- un solo usuario
// compartido que usa cualquiera que esté en caja (no hay cuentas
// individuales por persona). Misma forma que devuelve GET /api/auth/me.
export const currentEmployee = {
  _id: 'user-empleado',
  nombre: 'Empleado',
  email: 'empleado@sicovi.com',
  rol: 'empleado',
  activo: true,
  createdAt: '2026-08-01T10:00:00.000Z',
}
