import { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2, ImageOff, TriangleAlert, ChevronLeft, ChevronRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { formatCurrency } from '../lib/format'
import { apiFetch } from '../lib/api'
import useCategories from '../hooks/useCategories'
import useSuppliers from '../hooks/useSuppliers'

const emptyForm = {
  codigo: '',
  nombre: '',
  categoria: '',
  proveedor: '',
  unidadMedida: 'UNIDAD',
  precioCosto: '',
  precioVenta: '',
  stock: '',
  stockMinimo: '5',
}

function stockBadge(producto) {
  if (producto.stock <= 0) return <Badge tone="critical">Sin stock</Badge>
  if (producto.stock <= producto.stockMinimo) return <Badge tone="warning">Stock bajo</Badge>
  return <Badge tone="good">Disponible</Badge>
}

export default function ProductsPage() {
  const [busqueda, setBusqueda] = useState('')
  const [productos, setProductos] = useState([])
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  const { categories } = useCategories()
  const { suppliers } = useSuppliers()

  useEffect(() => {
    // Cada vez que cambia la búsqueda, se reinicia a la página 1.
    const idTimer = setTimeout(() => {
      cargarProductos(1)
    }, 250)
    return () => clearTimeout(idTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda])

  async function cargarProductos(paginaSolicitada = pagina) {
    setCargando(true)
    setErrorLista('')
    try {
      const params = new URLSearchParams({ pagina: paginaSolicitada, limite: '20' })
      if (busqueda) params.set('buscar', busqueda)
      const data = await apiFetch(`/products?${params.toString()}`)
      setProductos(data.productos)
      setPagina(data.pagina)
      setTotalPaginas(data.totalPaginas || 1)
      setTotal(data.total)
    } catch (err) {
      setErrorLista(err.message)
    } finally {
      setCargando(false)
    }
  }

  function abrirNuevo() {
    setEditId(null)
    setForm(emptyForm)
    setErrorForm('')
    setModalOpen(true)
  }

  function abrirEditar(producto) {
    setEditId(producto._id)
    setForm({
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: producto.categoria?._id || '',
      proveedor: producto.proveedor?._id || '',
      unidadMedida: producto.unidadMedida,
      precioCosto: producto.precioCosto,
      precioVenta: producto.precioVenta,
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
    })
    setErrorForm('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorForm('')
    setGuardando(true)
    try {
      const payload = {
        codigo: form.codigo,
        nombre: form.nombre,
        categoria: form.categoria || null,
        proveedor: form.proveedor || null,
        unidadMedida: form.unidadMedida,
        precioCosto: Number(form.precioCosto),
        precioVenta: Number(form.precioVenta),
        stockMinimo: Number(form.stockMinimo),
      }
      if (!editId) payload.stock = Number(form.stock) || 0

      if (editId) {
        await apiFetch(`/products/${editId}`, { method: 'PUT', body: payload })
      } else {
        await apiFetch('/products', { method: 'POST', body: payload })
      }
      setModalOpen(false)
      // Un producto nuevo se va a la página 1 (orden alfabético) para que
      // se vea de una vez -- si estabas en otra página, antes parecía que
      // "no pasaba nada" porque el nuevo quedaba fuera de esa página.
      await cargarProductos(editId ? pagina : 1)
    } catch (err) {
      setErrorForm(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDesactivar(producto) {
    if (!confirm(`¿Desactivar "${producto.nombre}"?`)) return
    try {
      await apiFetch(`/products/${producto._id}`, { method: 'DELETE' })
      await cargarProductos(pagina)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Productos"
        description={`${total} productos registrados en el inventario`}
        action={
          <button type="button" onClick={abrirNuevo} className="btn-primary">
            <Plus size={16} />
            Nuevo producto
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
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

      <div className="table-shell">
        {cargando ? (
          <EmptyState title="Cargando productos..." />
        ) : productos.length === 0 ? (
          <EmptyState icon={Search} title="Sin productos" description="Prueba con otra búsqueda o crea el primero" />
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Producto</th>
                <th className="th">Categoría</th>
                <th className="th text-right">Stock</th>
                <th className="th text-right">Costo</th>
                <th className="th text-right">Venta</th>
                <th className="th text-right">Margen</th>
                <th className="th">Estado</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p._id} className="hover:bg-ink/[0.02]">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink/5 text-ink-muted overflow-hidden">
                        {p.imagen ? <img src={p.imagen} alt="" className="h-full w-full object-cover" /> : <ImageOff size={16} />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{p.nombre}</p>
                        <p className="text-xs text-ink-muted">{p.codigo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td text-ink-soft">{p.categoria?.nombre || '—'}</td>
                  <td className="td text-right tabular-nums">{p.stock}</td>
                  <td className="td text-right tabular-nums text-ink-soft">{formatCurrency(p.precioCosto)}</td>
                  <td className="td text-right tabular-nums">{formatCurrency(p.precioVenta)}</td>
                  <td className="td text-right tabular-nums text-good">{p.margenPorcentaje}%</td>
                  <td className="td">{stockBadge(p)}</td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => abrirEditar(p)} className="btn-icon" aria-label="Editar">
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDesactivar(p)}
                        className="btn-icon hover:bg-critical/10! hover:text-critical!"
                        aria-label="Desactivar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm text-ink-soft">
          <span>Página {pagina} de {totalPaginas} · {total} productos</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cargarProductos(pagina - 1)}
              disabled={pagina <= 1 || cargando}
              className="btn-secondary px-2.5! py-1.5!"
            >
              <ChevronLeft size={15} />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => cargarProductos(pagina + 1)}
              disabled={pagina >= totalPaginas || cargando}
              className="btn-secondary px-2.5! py-1.5!"
            >
              Siguiente
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Editar producto' : 'Nuevo producto'}
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" form="product-form" disabled={guardando} className="btn-primary">
              {guardando ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {errorForm && (
            <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
              <TriangleAlert size={16} />
              {errorForm}
            </div>
          )}

          <div>
            <label className="field-label" htmlFor="codigo">Código</label>
            <input
              id="codigo"
              className="field-input"
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="VAL025"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="unidad">Unidad de medida</label>
            <input
              id="unidad"
              className="field-input"
              value={form.unidadMedida}
              onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
              placeholder="UNIDAD"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="nombre">Nombre / descripción</label>
            <input
              id="nombre"
              className="field-input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Pachón Valvoline Full Premium 10W30"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              className="field-select"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              <option value="">Selecciona...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="proveedor">Proveedor</label>
            <select
              id="proveedor"
              className="field-select"
              value={form.proveedor}
              onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
            >
              <option value="">Selecciona...</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="costo">Precio de costo</label>
            <input
              id="costo"
              type="number"
              step="0.01"
              min="0"
              className="field-input"
              value={form.precioCosto}
              onChange={(e) => setForm({ ...form, precioCosto: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="venta">Precio de venta</label>
            <input
              id="venta"
              type="number"
              step="0.01"
              min="0"
              className="field-input"
              value={form.precioVenta}
              onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          {!editId && (
            <div>
              <label className="field-label" htmlFor="stock">Stock inicial</label>
              <input
                id="stock"
                type="number"
                min="0"
                className="field-input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
              />
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="stockMinimo">Stock mínimo (alerta)</label>
            <input
              id="stockMinimo"
              type="number"
              min="0"
              className="field-input"
              value={form.stockMinimo}
              onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
              placeholder="5"
            />
          </div>

          {editId && (
            <p className="sm:col-span-2 text-xs text-ink-muted">
              El stock ({form.stock} unidades) solo cambia con compras, ventas o anulaciones -- no se edita aquí.
            </p>
          )}
        </form>
      </Modal>
    </div>
  )
}
