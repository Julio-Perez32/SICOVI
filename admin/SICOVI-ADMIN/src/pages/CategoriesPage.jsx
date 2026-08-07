import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { categories } from '../mock/categories'
import { products } from '../mock/products'

const emptyForm = { nombre: '', descripcion: '' }

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  function abrirNueva() {
    setEditId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function abrirEditar(categoria) {
    setEditId(categoria._id)
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' })
    setModalOpen(true)
  }

  function contarProductos(categoriaId) {
    return products.filter((p) => p.categoria?._id === categoriaId).length
  }

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Agrupan los productos del inventario"
        action={
          <button type="button" onClick={abrirNueva} className="btn-primary">
            <Plus size={16} />
            Nueva categoría
          </button>
        }
      />

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th className="th">Nombre</th>
              <th className="th">Descripción</th>
              <th className="th text-right">Productos</th>
              <th className="th">Estado</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="hover:bg-ink/[0.02]">
                <td className="td font-medium text-ink">{c.nombre}</td>
                <td className="td text-ink-soft">{c.descripcion || '—'}</td>
                <td className="td text-right tabular-nums">{contarProductos(c._id)}</td>
                <td className="td"><Badge tone={c.activo ? 'good' : 'neutral'}>{c.activo ? 'Activa' : 'Inactiva'}</Badge></td>
                <td className="td">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => abrirEditar(c)} className="btn-icon" aria-label="Editar">
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
        title={editId ? 'Editar categoría' : 'Nueva categoría'}
        description="Vista previa de formulario -- todavía no guarda datos reales"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="category-form" className="btn-primary">
              {editId ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={(e) => { e.preventDefault(); setModalOpen(false) }} className="flex flex-col gap-4">
          <div>
            <label className="field-label" htmlFor="nombre">Nombre</label>
            <input id="nombre" className="field-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Lubricantes" />
          </div>
          <div>
            <label className="field-label" htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" rows={3} className="field-textarea" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Aceites y refrigerantes" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
