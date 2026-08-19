import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const TITLES = {
  '/': 'Vender',
  '/ventas': 'Ventas',
}

export default function Topbar({ onOpenMobileNav }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-hairline bg-card px-4 md:px-6 py-3.5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onOpenMobileNav} className="btn-icon md:hidden">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-ink">{TITLES[pathname] || 'ODM'}</h1>
      </div>

      {/* Al ser una sola cuenta compartida de ventas, no tiene sentido mostrar
          "quién" está conectado: siempre es la misma. Solo queda salir. */}
      <button
        type="button"
        onClick={handleLogout}
        className="btn-secondary px-3! py-1.5! text-sm"
        title="Cerrar sesión"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </header>
  )
}
