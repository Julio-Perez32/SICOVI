import { NavLink } from 'react-router-dom'
import { ShoppingCart, Receipt, UserRound, Wrench, X } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Vender', icon: ShoppingCart, end: true },
  { to: '/ventas', label: 'Mis ventas', icon: Receipt },
  { to: '/cuenta', label: 'Mi cuenta', icon: UserRound },
]

function NavItems({ onNavigate }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-accent/10 text-accent' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
    }`

  return (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={linkClass} onClick={onNavigate}>
          <Icon size={18} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-6 py-5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white">
        <Wrench size={18} />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-ink">SICOVI</p>
        <p className="text-xs text-ink-muted">Panel de empleados</p>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }) {
  return (
    <>
      {/* Desktop: fija a la izquierda */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-hairline bg-card">
        <Brand />
        <NavItems />
        <div className="border-t border-hairline px-4 py-4 text-xs text-ink-muted">
          Taller de repuestos y lubricantes
        </div>
      </aside>

      {/* Mobile: drawer superpuesto */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-72 flex-col bg-card shadow-2xl">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button type="button" onClick={onCloseMobile} className="btn-icon" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <NavItems onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  )
}
