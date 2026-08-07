import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { suppliers } from '../mock/suppliers'

const emptyForm = { nombre: '', nit: '', nrc: '', direccion: '', telefono: '', email: '' }

export default function SuppliersPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  function abrirNuevo() {
    setEditId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function abrirEditar(proveedor) {
    setEditId(proveedor._id)
    setForm({
      nombre: proveedor.nombre,
      nit: proveedor.nit || '',
      nrc: proveedor.nrc || '',
      direccion: proveedor.direccion || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
    })
    setModalOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Proveedores"
        description="A quién se le compra el inventario"
        action={
          <button type="button" onClick={abrirNuevo} className="btn-primary">
            <Plus size={16} />
            Nuevo proveedor
          </button>
        }
      />

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th className="th">Proveedor</th>
              <th className="th">NIT / NRC</th>
              <th className="th">Contacto</th>
              <th className="th">Estado</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s._id} className="hover:bg-ink/[0.02]">
                <td className="td">
                  <p className="font-medium text-ink">{s.nombre}</p>
                  <p className="text-xs text-ink-muted">{s.direccion}</p>
                </td>
                <td className="td text-ink-soft">
                  <p>{s.nit}</p>
                  <p className="text-xs text-ink-muted">NRC {s.nrc}</p>
                </td>
                <td className="td text-ink-soft">
                  <p>{s.email}</p>
                  <p className="text-xs text-ink-muted">{s.telefono}</p>
                </td>
                <td className="td"><Badge tone={s.activo ? 'good' : 'neutral'}>{s.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                <td className="td">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => abrirEditar(s)} className="btn-icon" aria-label="Editar">
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
        title={editId ? 'Editar proveedor' : 'Nuevo proveedor'}
        description="Vista previa de formulario -- todavía no guarda datos reales"
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="supplier-form" className="btn-primary">
              {editId ? 'Guardar cambios' : 'Crear proveedor'}
            </button>
          </>
        }
      >
        <form id="supplier-form" onSubmit={(e) => { e.preventDefault(); setModalOpen(false) }} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="nombre">Nombre / razón social</label>
            <input id="nombre" className="field-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="SIGLO 2000, S.A. DE C.V." />
          </div>
          <div>
            <label className="field-label" htmlFor="nit">NIT</label>
            <input id="nit" className="field-input" value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} placeholder="0614-230323-101-5" />
          </div>
          <div>
            <label className="field-label" htmlFor="nrc">NRC</label>
            <input id="nrc" className="field-input" value={form.nrc} onChange={(e) => setForm({ ...form, nrc: e.target.value })} placeholder="3271159" />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="direccion">Dirección</label>
            <input id="direccion" className="field-input" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="San Salvador, El Salvador" />
          </div>
          <div>
            <label className="field-label" htmlFor="telefono">Teléfono</label>
            <input id="telefono" className="field-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="2281-2368" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Correo</label>
            <input id="email" type="email" className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ventas@proveedor.com" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
