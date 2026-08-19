import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import Aviso from '../components/Aviso'
import { apiFetch } from '../lib/api'

const emptyForm = { nombre: '', descripcion: '' }

export default function CategoriesPage() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarCategorias()
  }, [])

  async function cargarCategorias() {
    setCargando(true)
    setErrorLista('')
    try {
      const data = await apiFetch('/categories')
      setCategorias(data.categorias)
    } catch (err) {
      setErrorLista(err.message)
    } finally {
      setCargando(false)
    }
  }

  function abrirNueva() {
    setEditId(null)
    setForm(emptyForm)
    setErrorForm('')
    setModalOpen(true)
  }

  function abrirEditar(categoria) {
    setEditId(categoria._id)
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' })
    setErrorForm('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorForm('')
    setGuardando(true)
    try {
      if (editId) {
        await apiFetch(`/categories/${editId}`, { method: 'PUT', body: form })
      } else {
        await apiFetch('/categories', { method: 'POST', body: form })
      }
      setModalOpen(false)
      await cargarCategorias()
    } catch (err) {
      setErrorForm(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDesactivar(categoria) {
    if (!confirm(`¿Desactivar "${categoria.nombre}"?`)) return
    try {
      await apiFetch(`/categories/${categoria._id}`, { method: 'DELETE' })
      await cargarCategorias()
    } catch (err) {
      setErrorLista(err.message)
    }
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

      <Aviso mensaje={errorLista} onCerrar={() => setErrorLista('')} className="mb-4" />

      <div className="table-shell">
        {cargando ? (
          <EmptyState title="Cargando categorías..." />
        ) : categorias.length === 0 ? (
          <EmptyState title="Sin categorías" description="Crea la primera para empezar a clasificar productos" />
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Nombre</th>
                <th className="th">Descripción</th>
                <th className="th">Estado</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c._id} className="hover:bg-ink/[0.02]">
                  <td className="td font-medium text-ink">{c.nombre}</td>
                  <td className="td text-ink-soft">{c.descripcion || '—'}</td>
                  <td className="td"><Badge tone={c.activo ? 'good' : 'neutral'}>{c.activo ? 'Activa' : 'Inactiva'}</Badge></td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => abrirEditar(c)} className="btn-icon" aria-label="Editar">
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDesactivar(c)}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Editar categoría' : 'Nueva categoría'}
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="category-form" disabled={guardando} className="btn-primary">
              {guardando ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Aviso mensaje={errorForm} />
          <div>
            <label className="field-label" htmlFor="nombre">Nombre</label>
            <input id="nombre" className="field-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Lubricantes" required />
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
