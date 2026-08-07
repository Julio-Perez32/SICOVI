import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { formatDate } from '../lib/format'
import { employees } from '../mock/employees'

const emptyForm = { nombre: '', email: '', password: '', telefono: '', rol: 'empleado' }

export default function EmployeesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)

  function abrirNuevo() {
    setEditId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function abrirEditar(user) {
    setEditId(user._id)
    setForm({ nombre: user.nombre, email: user.email, password: '', telefono: user.telefono || '', rol: user.rol })
    setModalOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Empleados"
        description="Usuarios que pueden entrar al sistema"
        action={
          <button type="button" onClick={abrirNuevo} className="btn-primary">
            <Plus size={16} />
            Nuevo empleado
          </button>
        }
      />

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th className="th">Nombre</th>
              <th className="th">Correo</th>
              <th className="th">Teléfono</th>
              <th className="th">Rol</th>
              <th className="th">Desde</th>
              <th className="th">Estado</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((u) => (
              <tr key={u._id} className="hover:bg-ink/[0.02]">
                <td className="td font-medium text-ink">{u.nombre}</td>
                <td className="td text-ink-soft">{u.email}</td>
                <td className="td text-ink-soft">{u.telefono || '—'}</td>
                <td className="td">
                  <Badge tone={u.rol === 'admin' ? 'accent' : 'neutral'}>{u.rol === 'admin' ? 'Admin' : 'Empleado'}</Badge>
                </td>
                <td className="td text-ink-soft">{formatDate(u.createdAt)}</td>
                <td className="td">
                  <Badge tone={u.activo ? 'good' : 'critical'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                </td>
                <td className="td">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => abrirEditar(u)} className="btn-icon" aria-label="Editar">
                      <Pencil size={15} />
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
        title={editId ? 'Editar empleado' : 'Nuevo empleado'}
        description="Vista previa de formulario -- todavía no guarda datos reales"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="employee-form" className="btn-primary">
              {editId ? 'Guardar cambios' : 'Crear empleado'}
            </button>
          </>
        }
      >
        <form id="employee-form" onSubmit={(e) => { e.preventDefault(); setModalOpen(false) }} className="flex flex-col gap-4">
          <div>
            <label className="field-label" htmlFor="nombre">Nombre completo</label>
            <input id="nombre" className="field-input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Antonhy Campos" />
          </div>
          <div>
            <label className="field-label" htmlFor="email">Correo</label>
            <input id="email" type="email" className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="empleado@sicovi.com" />
          </div>
          {!editId && (
            <div>
              <label className="field-label" htmlFor="password">Contraseña temporal</label>
              <input id="password" type="password" className="field-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="telefono">Teléfono</label>
              <input id="telefono" className="field-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="7000-0000" />
            </div>
            <div>
              <label className="field-label" htmlFor="rol">Rol</label>
              <select id="rol" className="field-select" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                <option value="empleado">Empleado</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
