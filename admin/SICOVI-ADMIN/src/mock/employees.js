// Datos de ejemplo -- ya no hay cuentas individuales por empleado: solo
// el admin y una cuenta compartida "Empleado" que usa cualquiera que esté
// en caja para registrar ventas.
export const employees = [
  {
    _id: 'user-1',
    nombre: 'Administrador SICOVI',
    email: 'admin@sicovi.com',
    rol: 'admin',
    telefono: '',
    activo: true,
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    _id: 'user-empleado',
    nombre: 'Empleado',
    email: 'empleado@sicovi.com',
    rol: 'empleado',
    telefono: '',
    activo: true,
    createdAt: '2026-08-01T10:05:00.000Z',
  },
]

// La cuenta compartida que usan todos los que venden -- la que administra
// la página "Acceso de ventas".
export const sharedSalesAccount = employees.find((e) => e.rol === 'empleado')
