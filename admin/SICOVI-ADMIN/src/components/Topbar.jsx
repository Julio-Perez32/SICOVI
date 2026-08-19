import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Bell, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useUnreadAlerts from '../hooks/useUnreadAlerts'

const TITLES = {
  '/': 'Dashboard',
  '/productos': 'Productos',
  '/servicios': 'Servicios',
  '/categorias': 'Categorías',
  '/proveedores': 'Proveedores',
  '/compras': 'Compras',
  '/ventas': 'Ventas',
  '/acceso-ventas': 'Acceso de ventas',
  '/alertas': 'Alertas de stock',
}

export default function Topbar({ onOpenMobileNav }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const alertasSinLeer = useUnreadAlerts()

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

      <div className="flex items-center gap-2">
        <Link to="/alertas" className="relative btn-icon" aria-label="Alertas">
          <Bell size={19} />
          {alertasSinLeer > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-critical ring-2 ring-card" />
          )}
        </Link>

        <div className="mx-1 hidden sm:flex items-center gap-2.5 rounded-lg px-2 py-1">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
            {user?.nombre?.charAt(0) || 'A'}
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
