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
  const { user, logout } = useAuth()

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
        <h1 className="text-lg font-semibold text-ink">{TITLES[pathname] || 'SICOVI'}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="mx-1 hidden sm:flex items-center gap-2.5 rounded-lg px-2 py-1">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
            {user?.nombre?.charAt(0) || 'E'}
          </span>
          <div className="leading-tight text-left">
            <p className="text-sm font-medium text-ink">{user?.nombre}</p>
            <p className="text-xs text-ink-muted">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-icon"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={19} />
        </button>
      </div>
    </header>
  )
}
