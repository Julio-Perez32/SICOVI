import { useEffect, useState } from 'react'
import { KeyRound, UserCog, ShieldCheck, TriangleAlert } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { formatDate } from '../lib/format'
import { apiFetch } from '../lib/api'

// Ya no hay cuentas individuales por empleado: todo el que vende usa esta
// misma cuenta compartida. Aquí el admin solo puede ver sus datos y
// cambiarle el usuario o la contraseña (por ejemplo, cuando alguien que
// los sabía deja de trabajar en el taller).
export default function EmployeesPage() {
  const [cuenta, setCuenta] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  const [modalPassword, setModalPassword] = useState(false)
  const [passwordNueva, setPasswordNueva] = useState('')
  const [passwordConfirmar, setPasswordConfirmar] = useState('')
  const [errorPassword, setErrorPassword] = useState('')
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const [exitoPassword, setExitoPassword] = useState(false)

  const [modalUsuario, setModalUsuario] = useState(false)
  const [username, setUsername] = useState('')
  const [errorUsuario, setErrorUsuario] = useState('')
  const [guardandoUsuario, setGuardandoUsuario] = useState(false)

  useEffect(() => {
    cargarCuenta()
  }, [])

  async function cargarCuenta() {
    setCargando(true)
    setErrorLista('')
    try {
      const data = await apiFetch('/auth/employees?rol=empleado')
      setCuenta(data.users[0] || null)
    } catch (err) {
      setErrorLista(err.message)
    } finally {
      setCargando(false)
    }
  }

  function abrirModalPassword() {
    setPasswordNueva('')
    setPasswordConfirmar('')
    setErrorPassword('')
    setExitoPassword(false)
    setModalPassword(true)
  }

  async function handleSubmitPassword(e) {
    e.preventDefault()
    setErrorPassword('')
    if (passwordNueva.length < 6) {
      setErrorPassword('La contraseña nueva debe tener al menos 6 caracteres')
      return
    }
    if (passwordNueva !== passwordConfirmar) {
      setErrorPassword('Las contraseñas no coinciden')
      return
    }

    setGuardandoPassword(true)
    try {
      await apiFetch(`/auth/employees/${cuenta._id}/password`, {
        method: 'PATCH',
        body: { passwordNueva },
      })
      setExitoPassword(true)
      setTimeout(() => setModalPassword(false), 1200)
    } catch (err) {
      setErrorPassword(err.message)
    } finally {
      setGuardandoPassword(false)
    }
  }

  function abrirModalUsuario() {
    setUsername(cuenta.username || '')
    setErrorUsuario('')
    setModalUsuario(true)
  }

  async function handleSubmitUsuario(e) {
    e.preventDefault()
    setErrorUsuario('')
    if (!username.trim()) {
      setErrorUsuario('El usuario no puede quedar vacío')
      return
    }

    setGuardandoUsuario(true)
    try {
      const data = await apiFetch(`/auth/employees/${cuenta._id}`, {
        method: 'PATCH',
        body: { username: username.trim() },
      })
      setCuenta(data.user)
      setModalUsuario(false)
    } catch (err) {
      setErrorUsuario(err.message)
    } finally {
      setGuardandoUsuario(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Acceso de ventas"
        description="Cuenta compartida que usa cualquiera que esté en caja para registrar ventas"
      />

      {errorLista && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
          <TriangleAlert size={16} />
          {errorLista}
        </div>
      )}

      {cargando ? (
        <EmptyState title="Cargando cuenta..." />
      ) : !cuenta ? (
        <div className="max-w-lg table-shell">
          <EmptyState
            icon={KeyRound}
            title="Todavía no existe la cuenta de ventas"
            description="Créala corriendo `npm run seed:empleado` en el backend (lee EMPLOYEE_SEED_EMAIL/PASSWORD del .env)"
          />
        </div>
      ) : (
        <div className="max-w-lg rounded-2xl bg-card p-5 ring-1 ring-hairline">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent/10 text-lg font-semibold text-accent">
              {cuenta.nombre.charAt(0)}
            </span>
            <div>
              <p className="text-base font-semibold text-ink">{cuenta.nombre}</p>
              <Badge tone={cuenta.activo ? 'good' : 'critical'}>
                {cuenta.activo ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Usuario (login)</dt>
              <dd className="mt-1 text-sm font-medium text-ink">{cuenta.username || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Correo</dt>
              <dd className="mt-1 text-sm text-ink">{cuenta.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">Creada</dt>
              <dd className="mt-1 text-sm text-ink">
                {formatDate(cuenta.createdAt, { day: '2-digit', month: 'long', year: 'numeric' })}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-ink/5 px-3 py-2.5 text-xs text-ink-soft">
            <ShieldCheck size={15} className="mt-0.5 shrink-0" />
            Esta es la única cuenta con rol "empleado": la usa todo el personal de venta, no hay una por persona.
            Entra a la app de empleados con el usuario, no con el correo.
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={abrirModalUsuario} className="btn-secondary">
              <UserCog size={16} />
              Cambiar usuario
            </button>
            <button type="button" onClick={abrirModalPassword} className="btn-secondary">
              <KeyRound size={16} />
              Restablecer contraseña
            </button>
          </div>
        </div>
      )}

      <Modal
        open={modalUsuario}
        onClose={() => setModalUsuario(false)}
        title="Cambiar usuario"
        description="Con esto entra a la app de empleados"
        footer={
          <>
            <button type="button" onClick={() => setModalUsuario(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="username-form" disabled={guardandoUsuario} className="btn-primary">
              {guardandoUsuario ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </>
        }
      >
        <form id="username-form" onSubmit={handleSubmitUsuario} className="flex flex-col gap-4">
          {errorUsuario && (
            <div className="flex items-center gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
              <TriangleAlert size={16} />
              {errorUsuario}
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="username">Usuario</label>
            <input
              id="username"
              className="field-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="empleado"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={modalPassword}
        onClose={() => setModalPassword(false)}
        title="Restablecer contraseña"
        footer={
          <>
            <button type="button" onClick={() => setModalPassword(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="reset-password-form" disabled={guardandoPassword} className="btn-primary">
              {guardandoPassword ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </>
        }
      >
        <form id="reset-password-form" onSubmit={handleSubmitPassword} className="flex flex-col gap-4">
          {errorPassword && (
            <div className="flex items-center gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
              <TriangleAlert size={16} />
              {errorPassword}
            </div>
          )}
          {exitoPassword && (
            <div className="rounded-lg bg-good/10 px-3 py-2 text-sm text-good">Contraseña actualizada</div>
          )}
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
