import { useEffect, useState } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, TriangleAlert } from 'lucide-react'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { formatCurrency } from '../lib/format'
import { apiFetch } from '../lib/api'

const METODOS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'otro', label: 'Otro' },
]

function stockBadge(producto) {
  if (producto.stock <= 0) return <Badge tone="critical">Sin stock</Badge>
  if (producto.stock <= producto.stockMinimo) return <Badge tone="warning">Queda poco</Badge>
  return null
}

export default function SellPage() {
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  const [cart, setCart] = useState([]) // [{ productId, codigo, nombre, precioVenta, cantidad, stockDisponible }]
  const [cliente, setCliente] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [confirmacion, setConfirmacion] = useState(false)
  const [errorVenta, setErrorVenta] = useState('')
  const [registrando, setRegistrando] = useState(false)

  useEffect(() => {
    const idTimer = setTimeout(() => cargarProductos(), 250)
    return () => clearTimeout(idTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda])

  async function cargarProductos() {
    setCargando(true)
    setErrorLista('')
    try {
      const query = busqueda ? `?buscar=${encodeURIComponent(busqueda)}` : ''
      const data = await apiFetch(`/products${query}`)
      setProductos(data.productos)
    } catch (err) {
      setErrorLista(err.message)
    } finally {
      setCargando(false)
    }
  }

  function agregarAlCarrito(producto) {
    if (producto.stock <= 0) return
    setCart((prev) => {
      const existente = prev.find((it) => it.productId === producto._id)
      if (existente) {
        if (existente.cantidad >= producto.stock) return prev
        return prev.map((it) => (it.productId === producto._id ? { ...it, cantidad: it.cantidad + 1 } : it))
      }
      return [
        ...prev,
        {
          productId: producto._id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precioVenta: producto.precioVenta,
          cantidad: 1,
          stockDisponible: producto.stock,
        },
      ]
    })
  }

  function cambiarCantidad(productId, delta) {
    setCart((prev) =>
      prev
        .map((it) =>
          it.productId === productId
            ? { ...it, cantidad: Math.min(Math.max(it.cantidad + delta, 0), it.stockDisponible) }
            : it
        )
        .filter((it) => it.cantidad > 0)
    )
  }

  function quitarDelCarrito(productId) {
    setCart((prev) => prev.filter((it) => it.productId !== productId))
  }

  const total = cart.reduce((acc, it) => acc + it.cantidad * it.precioVenta, 0)

  async function handleRegistrarVenta(e) {
    e.preventDefault()
    if (cart.length === 0) return
    setErrorVenta('')
    setRegistrando(true)
    try {
      await apiFetch('/sales', {
        method: 'POST',
        body: {
          cliente: cliente || undefined,
          metodoPago,
          items: cart.map((it) => ({ productoId: it.productId, cantidad: it.cantidad })),
        },
      })
      setCart([])
      setCliente('')
      setMetodoPago('efectivo')
      setConfirmacion(true)
      setTimeout(() => setConfirmacion(false), 3000)
      await cargarProductos() // refleja el stock nuevo
    } catch (err) {
      setErrorVenta(err.message)
    } finally {
      setRegistrando(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
      {/* Catálogo */}
      <div>
        <div className="relative mb-4 max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="field-input pl-9"
          />
        </div>

        {errorLista && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
            <TriangleAlert size={16} />
            {errorLista}
          </div>
        )}

        {cargando ? (
          <EmptyState title="Cargando catálogo..." />
        ) : productos.length === 0 ? (
          <div className="table-shell">
            <EmptyState icon={Search} title="Sin resultados" description="Prueba con otro código o nombre" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {productos.map((p) => {
              const sinStock = p.stock <= 0
              return (
                <div key={p._id} className="flex flex-col justify-between rounded-2xl bg-card p-4 ring-1 ring-hairline">
                  <div>
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug text-ink">{p.nombre}</p>
                    </div>
                    <p className="text-xs text-ink-muted">{p.codigo} · {p.categoria?.nombre}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {stockBadge(p)}
                      <span className="text-xs text-ink-muted">{p.stock} disponibles</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-semibold text-ink">{formatCurrency(p.precioVenta)}</span>
                    <button
                      type="button"
                      onClick={() => agregarAlCarrito(p)}
                      disabled={sinStock}
                      className="btn-primary px-3! py-1.5! text-sm"
                    >
                      <Plus size={15} />
                      Agregar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Carrito */}
      <div className="lg:sticky lg:top-0 lg:self-start">
        <form
          onSubmit={handleRegistrarVenta}
          className="flex max-h-[calc(100vh-7rem)] flex-col rounded-2xl bg-card ring-1 ring-hairline"
        >
          <div className="flex items-center gap-2 border-b border-hairline px-5 py-4">
            <ShoppingCart size={18} className="text-ink-soft" />
            <h3 className="text-sm font-semibold text-ink">Carrito</h3>
            {cart.length > 0 && <Badge tone="accent">{cart.length}</Badge>}
          </div>

          <div className="flex-1 overflow-y-auto scroll-thin px-5 py-3">
            {cart.length === 0 ? (
              <EmptyState icon={ShoppingCart} title="El carrito está vacío" description="Agrega productos del catálogo" />
            ) : (
              <ul className="flex flex-col gap-3">
                {cart.map((it) => (
                  <li key={it.productId} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{it.nombre}</p>
                      <p className="text-xs text-ink-muted">{it.codigo} · {formatCurrency(it.precioVenta)} c/u</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <button type="button" onClick={() => cambiarCantidad(it.productId, -1)} className="btn-icon h-6! w-6!">
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums text-ink">{it.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(it.productId, 1)}
                          disabled={it.cantidad >= it.stockDisponible}
                          className="btn-icon h-6! w-6!"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-sm font-medium text-ink tabular-nums">
                        {formatCurrency(it.cantidad * it.precioVenta)}
                      </span>
                      <button type="button" onClick={() => quitarDelCarrito(it.productId)} className="btn-icon h-6! w-6! hover:bg-critical/10! hover:text-critical!">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-hairline px-5 py-4">
            {errorVenta && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
                <TriangleAlert size={16} />
                {errorVenta}
              </div>
            )}

            <div className="mb-3">
              <label className="field-label" htmlFor="cliente">Cliente (opcional)</label>
              <input
                id="cliente"
                className="field-input"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Consumidor final"
              />
            </div>
            <div className="mb-4">
              <label className="field-label" htmlFor="metodoPago">Método de pago</label>
              <select id="metodoPago" className="field-select" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                {METODOS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4 flex items-center justify-between border-t border-hairline pt-3">
              <span className="text-sm text-ink-soft">Total</span>
              <span className="text-xl font-semibold text-ink">{formatCurrency(total)}</span>
            </div>

            <button type="submit" disabled={cart.length === 0 || registrando} className="btn-primary w-full">
              {registrando ? 'Registrando...' : 'Registrar venta'}
            </button>

            {confirmacion && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-good/10 px-3 py-2 text-sm text-good">
                <CheckCircle2 size={16} />
                Venta registrada
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
