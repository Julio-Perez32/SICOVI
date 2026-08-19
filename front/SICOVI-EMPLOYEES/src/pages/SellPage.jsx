import { useEffect, useState } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingCart, TriangleAlert, Package, Cog, Clock } from 'lucide-react'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import ReceiptModal from '../components/ReceiptModal'
import { formatCurrency } from '../lib/format'
import { apiFetch } from '../lib/api'

const METODOS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'otro', label: 'Otro' },
]

function formatDuracion(minutos) {
  if (!minutos) return null
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto ? `${horas} h ${resto} min` : `${horas} h`
}

function stockBadge(producto) {
  if (producto.stock <= 0) return <Badge tone="critical">Sin stock</Badge>
  if (producto.stock <= producto.stockMinimo) return <Badge tone="warning">Queda poco</Badge>
  return null
}

export default function SellPage() {
  const [pestana, setPestana] = useState('productos') // 'productos' | 'servicios'
  const [busqueda, setBusqueda] = useState('')

  const [productos, setProductos] = useState([])
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  // Cada línea: { key, tipo, refId, codigo, nombre, precio, cantidad, stockDisponible }
  const [cart, setCart] = useState([])
  const [cliente, setCliente] = useState('')
  const [vehiculo, setVehiculo] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [errorVenta, setErrorVenta] = useState('')
  const [cobrando, setCobrando] = useState(false)
  const [comprobante, setComprobante] = useState(null)

  useEffect(() => {
    const idTimer = setTimeout(() => cargarCatalogo(), 250)
    return () => clearTimeout(idTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda])

  async function cargarCatalogo() {
    setCargando(true)
    setErrorLista('')
    try {
      // Se traen ambos catálogos completos: el empleado está atendiendo a
      // alguien, no va a andar paginando.
      const params = new URLSearchParams({ limite: '100' })
      if (busqueda) params.set('buscar', busqueda)
      const paramsSrv = new URLSearchParams()
      if (busqueda) paramsSrv.set('buscar', busqueda)

      const [dataProd, dataSrv] = await Promise.all([
        apiFetch(`/products?${params.toString()}`),
        apiFetch(`/services?${paramsSrv.toString()}`),
      ])
      setProductos(dataProd.productos)
      setServicios(dataSrv.servicios)
    } catch (err) {
      setErrorLista(err.message)
    } finally {
      setCargando(false)
    }
  }

  function agregarProducto(producto) {
    if (producto.stock <= 0) return
    const key = `producto-${producto._id}`
    setCart((prev) => {
      const existente = prev.find((it) => it.key === key)
      if (existente) {
        if (existente.cantidad >= producto.stock) return prev
        return prev.map((it) => (it.key === key ? { ...it, cantidad: it.cantidad + 1 } : it))
      }
      return [
        ...prev,
        {
          key,
          tipo: 'producto',
          refId: producto._id,
          codigo: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precioVenta,
          cantidad: 1,
          stockDisponible: producto.stock,
        },
      ]
    })
  }

  function agregarServicio(servicio) {
    const key = `servicio-${servicio._id}`
    setCart((prev) => {
      const existente = prev.find((it) => it.key === key)
      if (existente) {
        return prev.map((it) => (it.key === key ? { ...it, cantidad: it.cantidad + 1 } : it))
      }
      return [
        ...prev,
        {
          key,
          tipo: 'servicio',
          refId: servicio._id,
          codigo: servicio.codigo,
          nombre: servicio.nombre,
          precio: servicio.precio,
          cantidad: 1,
          stockDisponible: null, // un servicio no se acaba
        },
      ]
    })
  }

  function cambiarCantidad(key, delta) {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.key !== key) return it
          const tope = it.stockDisponible ?? Infinity
          return { ...it, cantidad: Math.min(Math.max(it.cantidad + delta, 0), tope) }
        })
        .filter((it) => it.cantidad > 0)
    )
  }

  function quitarDelCarrito(key) {
    setCart((prev) => prev.filter((it) => it.key !== key))
  }

  const total = cart.reduce((acc, it) => acc + it.cantidad * it.precio, 0)

  async function handleCobrar(e) {
    e.preventDefault()
    if (cart.length === 0) return
    setErrorVenta('')
    setCobrando(true)
    try {
      const data = await apiFetch('/sales', {
        method: 'POST',
        body: {
          cliente: cliente || undefined,
          vehiculo: vehiculo || undefined,
          metodoPago,
          items: cart.map((it) =>
            it.tipo === 'servicio'
              ? { tipo: 'servicio', servicioId: it.refId, cantidad: it.cantidad }
              : { tipo: 'producto', productoId: it.refId, cantidad: it.cantidad }
          ),
        },
      })

      setComprobante(data.venta) // abre el comprobante
      setCart([])
      setCliente('')
      setVehiculo('')
      setMetodoPago('efectivo')
      await cargarCatalogo() // refleja el stock nuevo
    } catch (err) {
      setErrorVenta(err.message)
    } finally {
      setCobrando(false)
    }
  }

  const listaVacia = pestana === 'productos' ? productos.length === 0 : servicios.length === 0

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
        {/* Catálogo */}
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* Pestañas */}
            <div className="inline-flex rounded-lg bg-ink/5 p-1">
              <button
                type="button"
                onClick={() => setPestana('productos')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pestana === 'productos' ? 'bg-card text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                }`}
              >
                <Package size={15} />
                Productos
                <span className="text-xs text-ink-muted">{productos.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setPestana('servicios')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pestana === 'servicios' ? 'bg-card text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
                }`}
              >
                <Cog size={15} />
                Servicios
                <span className="text-xs text-ink-muted">{servicios.length}</span>
              </button>
            </div>

            <div className="relative min-w-[16rem] flex-1 sm:max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por código o nombre..."
                className="field-input pl-9"
              />
            </div>
          </div>

          {errorLista && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
              <TriangleAlert size={16} />
              {errorLista}
            </div>
          )}

          {cargando ? (
            <EmptyState title="Cargando catálogo..." />
          ) : listaVacia ? (
            <div className="table-shell">
              <EmptyState icon={Search} title="Sin resultados" description="Prueba con otro código o nombre" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {pestana === 'productos'
                ? productos.map((p) => {
                    const sinStock = p.stock <= 0
                    return (
                      <div key={p._id} className="flex flex-col justify-between rounded-2xl bg-card p-4 ring-1 ring-hairline">
                        <div>
                          <p className="text-sm font-medium leading-snug text-ink">{p.nombre}</p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {p.codigo} · {p.categoria?.nombre}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            {stockBadge(p)}
                            <span className="text-xs text-ink-muted">{p.stock} disponibles</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-semibold text-ink">{formatCurrency(p.precioVenta)}</span>
                          <button
                            type="button"
                            onClick={() => agregarProducto(p)}
                            disabled={sinStock}
                            className="btn-primary px-3! py-1.5! text-sm"
                          >
                            <Plus size={15} />
                            Agregar
                          </button>
                        </div>
                      </div>
                    )
                  })
                : servicios.map((s) => {
                    const duracion = formatDuracion(s.duracionMinutos)
                    return (
                      <div key={s._id} className="flex flex-col justify-between rounded-2xl bg-card p-4 ring-1 ring-hairline">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-snug text-ink">{s.nombre}</p>
                            <Cog size={15} className="mt-0.5 shrink-0 text-ink-muted" />
                          </div>
                          <p className="mt-0.5 text-xs text-ink-muted">{s.codigo}</p>
                          {duracion && (
                            <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                              <Clock size={12} />
                              {duracion}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-semibold text-ink">{formatCurrency(s.precio)}</span>
                          <button
                            type="button"
                            onClick={() => agregarServicio(s)}
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
            onSubmit={handleCobrar}
            className="flex max-h-[calc(100vh-7rem)] flex-col rounded-2xl bg-card ring-1 ring-hairline"
          >
            <div className="flex items-center gap-2 border-b border-hairline px-5 py-4">
              <ShoppingCart size={18} className="text-ink-soft" />
              <h3 className="text-sm font-semibold text-ink">Orden de servicio</h3>
              {cart.length > 0 && <Badge tone="accent">{cart.length}</Badge>}
            </div>

            <div className="flex-1 overflow-y-auto scroll-thin px-5 py-3">
              {cart.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title="Todavía no hay nada"
                  description="Agrega productos y servicios del catálogo"
                />
              ) : (
                <ul className="flex flex-col gap-3">
                  {cart.map((it) => (
                    <li key={it.key} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-medium text-ink">{it.nombre}</p>
                          {it.tipo === 'servicio' && <Cog size={12} className="shrink-0 text-ink-muted" />}
                        </div>
                        <p className="text-xs text-ink-muted">
                          {it.codigo} · {formatCurrency(it.precio)} c/u
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <button type="button" onClick={() => cambiarCantidad(it.key, -1)} className="btn-icon h-6! w-6!">
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-sm tabular-nums text-ink">{it.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => cambiarCantidad(it.key, 1)}
                            disabled={it.stockDisponible !== null && it.cantidad >= it.stockDisponible}
                            className="btn-icon h-6! w-6!"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-sm font-medium tabular-nums text-ink">
                          {formatCurrency(it.cantidad * it.precio)}
                        </span>
                        <button
                          type="button"
                          onClick={() => quitarDelCarrito(it.key)}
                          className="btn-icon h-6! w-6! hover:bg-critical/10! hover:text-critical!"
                        >
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

              <div className="mb-3">
                <label className="field-label" htmlFor="vehiculo">Vehículo (opcional)</label>
                <input
                  id="vehiculo"
                  className="field-input"
                  value={vehiculo}
                  onChange={(e) => setVehiculo(e.target.value)}
                  placeholder="Toyota Corolla 2015 · P123-456"
                />
              </div>
              <div className="mb-4">
                <label className="field-label" htmlFor="metodoPago">Método de pago</label>
                <select
                  id="metodoPago"
                  className="field-select"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  {METODOS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4 flex items-center justify-between border-t border-hairline pt-3">
                <span className="text-sm text-ink-soft">Total</span>
                <span className="text-xl font-semibold text-ink">{formatCurrency(total)}</span>
              </div>

              <button type="submit" disabled={cart.length === 0 || cobrando} className="btn-primary w-full">
                {cobrando ? 'Cobrando...' : 'Cobrar y generar orden'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ReceiptModal venta={comprobante} onClose={() => setComprobante(null)} />
    </>
  )
}
