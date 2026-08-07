import { useState } from 'react'
import { UserRound, Mail, Phone, KeyRound, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import { formatDate } from '../lib/format'
import { currentEmployee } from '../mock/session'

export default function AccountPage() {
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')
  const [guardado, setGuardado] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // Todavía sin conectar al backend: solo confirma visualmente.
    setPasswordActual('')
    setPasswordNueva('')
    setPasswordConfirmar('')
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Mi cuenta" description="Tus datos y tu contraseña de acceso" />

      <div className="mb-4 rounded-2xl bg-card p-5 ring-1 ring-hairline">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent/10 text-lg font-semibold text-accent">
            {currentEmployee.nombre.charAt(0)}
          </span>
          <div>
            <p className="text-base font-semibold text-ink">{currentEmployee.nombre}</p>
            <Badge tone="accent">Empleado</Badge>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
              <Mail size={13} /> Correo
            </dt>
            <dd className="mt-1 text-sm text-ink">{currentEmployee.email}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
              <Phone size={13} /> Teléfono
            </dt>
            <dd className="mt-1 text-sm text-ink">{currentEmployee.telefono || '—'}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
              <UserRound size={13} /> Empleado desde
            </dt>
            <dd className="mt-1 text-sm text-ink">{formatDate(currentEmployee.createdAt, { day: '2-digit', month: 'long', year: 'numeric' })}</dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-5 ring-1 ring-hairline">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound size={17} className="text-ink-soft" />
          <h3 className="text-sm font-semibold text-ink">Cambiar contraseña</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label" htmlFor="passwordActual">Contraseña actual</label>
            <input
              id="passwordActual"
              type="password"
              className="field-input"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button type="submit" className="btn-primary">Guardar cambios</button>
          {guardado && (
            <span className="flex items-center gap-1.5 text-sm text-good">
              <CheckCircle2 size={16} />
              Vista previa -- todavía no se guarda
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
