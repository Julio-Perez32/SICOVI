# SICOVI API

Base URL local: `http://localhost:4000/api`

Autenticación: JWT. Al hacer login se manda una cookie `httpOnly` llamada
`token` (para el frontend web) y también se devuelve `token` en el body
(para probar con Postman/Thunder Client mandando el header
`Authorization: Bearer <token>`).

Roles: `admin` y `empleado`. Donde no se diga lo contrario, cualquier usuario
logueado puede usar el endpoint.

Antes de usar la API por primera vez: `npm run seed:admin` (lee
`ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` del `.env`) y `npm run seed:empleado`
(lee `EMPLOYEE_SEED_EMAIL` / `EMPLOYEE_SEED_PASSWORD`) -- crea la única
cuenta compartida de ventas, no hay cuentas individuales por empleado.

---

## Auth — `/api/auth`

La cuenta de ventas inicia sesión con `username` (más fácil de escribir en
una terminal compartida); el admin sigue usando `email`. El admin puede
cambiar el `username` de la cuenta de ventas con `PATCH /employees/:id`.

| Método | Ruta | Rol | Body |
|---|---|---|---|
| POST | `/login` | público | `{ email, password }` **o** `{ username, password }` |
| POST | `/logout` | logueado | - |
| GET | `/me` | logueado | - |
| PATCH | `/me/password` | logueado | `{ passwordActual, passwordNueva }` |
| POST | `/employees` | admin | `{ nombre, email, password, username?, telefono?, rol? }` |
| GET | `/employees` | admin | query: `?rol=&activo=` |
| PATCH | `/employees/:id` | admin | `{ nombre?, telefono?, rol?, activo?, username? }` |
| PATCH | `/employees/:id/password` | admin | `{ passwordNueva }` — resetea la contraseña sin pedir la actual |

## Products — `/api/products`

| Método | Ruta | Rol | Notas |
|---|---|---|---|
| GET | `/` | logueado | query: `?buscar=&categoria=&proveedor=&soloActivos=&pagina=&limite=`. Si el usuario es `empleado`, la respuesta **no** incluye `precioCosto` ni `margen`. |
| GET | `/low-stock` | admin | productos con `stock <= stockMinimo` |
| GET | `/:id` | logueado | |
| POST | `/` | admin | `multipart/form-data` (campo `imagen` opcional) con `codigo, nombre, precioCosto, precioVenta, stock, stockMinimo?, unidadMedida?, categoria?, proveedor?, ubicacion?` |
| PUT | `/:id` | admin | mismos campos, todos opcionales |
| DELETE | `/:id` | admin | borrado suave (`activo=false`) |

## Categories — `/api/categories`

CRUD simple: `GET /` (todos), `POST /`, `PUT /:id`, `DELETE /:id` (admin escribe).

## Suppliers — `/api/suppliers`

CRUD simple: `GET /` (todos), `POST /`, `PUT /:id`, `DELETE /:id` (admin escribe).
Campos: `nombre, nit?, nrc?, direccion?, telefono?, email?`.

## Purchases — `/api/purchases` (todo admin)

| Método | Ruta | Body |
|---|---|---|
| GET | `/` | - |
| GET | `/:id` | - |
| POST | `/` | `{ proveedor, numeroDocumento?, fecha?, notas?, items: [{ productoId? , codigo, descripcion, cantidad, precioUnitario, unidadMedida?, precioVenta?, categoria?, stockMinimo? }] }` |

Si `productoId` no viene y no existe un producto con ese `codigo`, se crea el
producto (requiere `precioVenta` en ese caso). Cada línea sube el `stock` y
actualiza el `precioCosto` del producto al último precio pagado.

## Sales — `/api/sales`

| Método | Ruta | Rol | Body |
|---|---|---|---|
| GET | `/` | logueado | admin ve todas (`?vendedor=&desde=&hasta=`); empleado solo las suyas |
| GET | `/:id` | logueado | |
| POST | `/` | logueado | `{ cliente?, metodoPago?, items: [{ productoId, cantidad }] }` |
| PATCH | `/:id/void` | admin | `{ motivo? }` — anula la venta y repone el stock |

El precio de venta/costo se toma del producto en el servidor, no del body.
Si no hay stock suficiente responde `400`.

## Dashboard — `/api/dashboard` (todo admin)

| Ruta | Qué devuelve |
|---|---|
| `GET /summary` | KPIs: valor inventario (costo/venta), ganancia potencial, ventas de hoy/mes (+ganancia), # productos con stock bajo/sin stock, # alertas sin leer |
| `GET /sales-timeseries?range=7d\|30d` | ventas por día (para gráfico de línea) |
| `GET /top-products?limit=10` | productos más vendidos por unidades |
| `GET /margin-by-category` | valor de inventario y margen agrupado por categoría |
| `GET /sales-by-employee` | ranking de ventas por empleado |
| `GET /sales-by-payment-method` | ventas agrupadas por método de pago (efectivo/tarjeta/transferencia/otro) |
| `GET /recent-activity?limit=20` | últimos movimientos de stock (kardex) |

## Notifications — `/api/notifications` (todo admin)

`GET /?leida=false`, `PATCH /:id/read`. Se crean solas cuando un producto
cruza su `stockMinimo` (y se manda un correo a los admins vía nodemailer).

---

## Formato de respuesta

Éxito: `{ success: true, ...datos }`
Error: `{ success: false, message, errors?: [...] }`
