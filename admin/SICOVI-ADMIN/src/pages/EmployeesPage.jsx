import { useState } from 'react'
import { KeyRound, ShieldCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { formatDate } from '../lib/format'
import { sharedSalesAccount } from '../mock/employees'

// Ya no hay cuentas individuales por empleado: todo el que vende usa esta
// misma cuenta compartida. Aquí el admin solo puede ver sus datos y
// rotarle la contraseña (por ejemplo, cuando alguien que la sabía deja de
// trabajar en el taller).
export default function EmployeesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Todavía sin conectar al backend: por ahora solo cierra el modal.
    setPasswordNueva('')
    setPasswordConfirmar('')
    setModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Acceso de ventas"
        description="Cuenta compartida que usa cualquiera que esté en caja para registrar ventas"
      />

      <div className="max-w-lg rounded-2xl bg-card p-5 ring-1 ring-hairline">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent/10 text-lg font-semibold text-accent">
            {sharedSalesAccount.nombre.charAt(0)}
          </span>
          <div>
            <p className="text-base font-semibold text-ink">{sharedSalesAccount.nombre}</p>
            <Badge tone={sharedSalesAccount.activo ? 'good' : 'critical'}>
              {sharedSalesAccount.activo ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Correo</dt>
            <dd className="mt-1 text-sm text-ink">{sharedSalesAccount.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Creada</dt>
            <dd className="mt-1 text-sm text-ink">
              {formatDate(sharedSalesAccount.createdAt, { day: '2-digit', month: 'long', year: 'numeric' })}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex items-start gap-2 rounded-lg bg-ink/5 px-3 py-2.5 text-xs text-ink-soft">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          Esta es la única cuenta con rol "empleado": la usa todo el personal de venta, no hay una por persona.
        </div>

        <button type="button" onClick={() => setModalOpen(true)} className="btn-secondary mt-5">
          <KeyRound size={16} />
          Restablecer contraseña
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Restablecer contraseña"
        description="Vista previa de formulario -- todavía no guarda datos reales"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="reset-password-form" className="btn-primary">Guardar nueva contraseña</button>
          </>
        }
      >
        <form id="reset-password-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="field-label" htmlFor="passwordNueva">Contraseña nueva</label>
            <input
              id="passwordNueva"
              type="password"
              className="field-input"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="passwordConfirmar">Confirmar contraseña</label>
            <input
              id="passwordConfirmar"
              type="password"
              className="field-input"
              value={passwordConfirmar}
              onChange={(e) => setPasswordConfirmar(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
