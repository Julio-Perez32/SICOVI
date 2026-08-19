import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Mail, Lock, ArrowRight, TriangleAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { marca } from '../config/marca'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('pepesus3223@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      const user = await login(email, password)
      if (user.rol !== 'admin') {
        setError('Esta cuenta no tiene acceso al panel de administrador')
        return
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-page px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white">
            <Wrench size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-ink">{marca.taller}</h1>
            <p className="text-xs font-semibold tracking-wide text-ink-soft">SERVICIO MECÁNICO</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-6 ring-1 ring-hairline">
          <h2 className="mb-1 text-base font-semibold text-ink">Iniciar sesión</h2>
          <p className="mb-5 text-sm text-ink-soft">Panel de administrador</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <label className="field-label" htmlFor="email">Correo</label>
          <div className="relative mb-4">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input pl-9"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <label className="field-label" htmlFor="password">Contraseña</label>
          <div className="relative mb-6">
            <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input pl-9"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={enviando} className="btn-primary w-full">
            {enviando ? 'Entrando...' : 'Entrar'}
            {!enviando && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-snug text-ink-muted">
          {marca.sistema} · {marca.sistemaDescripcion}
        </p>
      </div>
    </div>
  )
}
