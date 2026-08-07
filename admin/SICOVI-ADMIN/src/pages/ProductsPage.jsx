import { useMemo, useState } from 'react'
import { Search, Plus, Pencil, Trash2, ImageOff } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { formatCurrency } from '../lib/format'
import { products as initialProducts } from '../mock/products'
import { categories } from '../mock/categories'
import { suppliers } from '../mock/suppliers'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return initialProducts
    return initialProducts.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
    )
  }, [busqueda])

  function abrirNuevo() {
    setEditId(null)
    setForm(emptyForm)
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
    setModalOpen(true)
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Todavía sin conectar al backend: por ahora solo cierra el modal.
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Productos"
        description={`${initialProducts.length} productos registrados en el inventario`}
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

      <div className="table-shell">
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
            {productosFiltrados.map((p) => (
              <tr key={p._id} className="hover:bg-ink/[0.02]">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink/5 text-ink-muted">
                      <ImageOff size={16} />
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
                    <button type="button" className="btn-icon hover:bg-critical/10! hover:text-critical!" aria-label="Desactivar">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Editar producto' : 'Nuevo producto'}
        description="Vista previa de formulario -- todavía no guarda datos reales"
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" form="product-form" className="btn-primary">
              {editId ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="codigo">Código</label>
            <input
              id="codigo"
              className="field-input"
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="VAL025"
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
              className="field-input"
              value={form.precioCosto}
              onChange={(e) => setForm({ ...form, precioCosto: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="venta">Precio de venta</label>
            <input
              id="venta"
              type="number"
              step="0.01"
              className="field-input"
              value={form.precioVenta}
              onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="stock">Stock inicial</label>
            <input
              id="stock"
              type="number"
              className="field-input"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="stockMinimo">Stock mínimo (alerta)</label>
            <input
              id="stockMinimo"
              type="number"
              className="field-input"
              value={form.stockMinimo}
              onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
              placeholder="5"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
