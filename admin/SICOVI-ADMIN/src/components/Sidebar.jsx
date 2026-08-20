import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ShoppingCart,
  Receipt,
  KeyRound,
  Cog,
  BellRing,
  Wrench,
  X,
} from 'lucide-react'
import useUnreadAlerts from '../hooks/useUnreadAlerts'
import { marca } from '../config/marca'
import { logoOdm } from '../assets/logoOdm'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/servicios', label: 'Servicios', icon: Cog },
  { to: '/categorias', label: 'Categorías', icon: Tags },
  { to: '/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/compras', label: 'Compras', icon: ShoppingCart },
  { to: '/ventas', label: 'Ventas', icon: Receipt },
  { to: '/acceso-ventas', label: 'Acceso de ventas', icon: KeyRound },
]

function NavItems({ onNavigate }) {
  const alertasSinLeer = useUnreadAlerts()
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

      <NavLink to="/alertas" className={linkClass} onClick={onNavigate}>
        <BellRing size={18} strokeWidth={2} />
        Alertas
        {alertasSinLeer > 0 && (
          <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-critical px-1 text-[11px] font-semibold text-white">
            {alertasSinLeer}
          </span>
        )}
      </NavLink>
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-6 py-5">
      {logoOdm ? (
        <img src={logoOdm} alt={marca.taller} className="h-9 w-auto shrink-0 rounded" />
      ) : (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-white">
          <Wrench size={18} />
        </span>
      )}
      <div className="leading-tight">
        <p className="text-sm font-semibold text-ink">{marca.taller}</p>
        <p className="text-xs text-ink-muted">{marca.subtitulo}</p>
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
        <div className="border-t border-hairline px-4 py-4">
          <p className="text-xs font-medium text-ink-soft">{marca.sistema}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{marca.sistemaDescripcion}</p>
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
