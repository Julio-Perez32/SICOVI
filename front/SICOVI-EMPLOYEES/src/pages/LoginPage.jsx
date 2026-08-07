import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Mail, Lock, ArrowRight } from 'lucide-react'

// Todavía sin conectar al backend: el submit solo navega a "Vender".
export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('empleado@sicovi.com')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="grid min-h-screen place-items-center bg-page px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white">
            <Wrench size={22} />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-ink">SICOVI</h1>
            <p className="text-sm text-ink-soft">Marca tus ventas del día</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-6 ring-1 ring-hairline">
          <h2 className="mb-1 text-base font-semibold text-ink">Iniciar sesión</h2>
          <p className="mb-5 text-sm text-ink-soft">Panel de empleados</p>

          <label className="field-label" htmlFor="email">Correo</label>
          <div className="relative mb-4">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input pl-9"
              placeholder="empleado@sicovi.com"
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

          <button type="submit" className="btn-primary w-full">
            Entrar
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Vista previa de interfaz -- todavía no conectada al backend
        </p>
      </div>
    </div>
  )
}
