import { useState } from 'react'
import { PackageX, TriangleAlert, Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { formatDateTime } from '../lib/format'
import { notifications as initialNotifications } from '../mock/notifications'

export default function AlertsPage() {
  const [notificaciones, setNotificaciones] = useState(initialNotifications)

  function marcarLeida(id) {
    setNotificaciones((prev) => prev.map((n) => (n._id === id ? { ...n, leida: true } : n)))
  }

  const sinLeer = notificaciones.filter((n) => !n.leida)
  const leidas = notificaciones.filter((n) => n.leida)

  return (
    <div>
      <PageHeader
        title="Alertas de stock"
        description="Avisos automáticos cuando un producto queda bajo o sin stock"
      />

      {notificaciones.length === 0 ? (
        <div className="table-shell">
          <EmptyState icon={Check} title="Sin alertas" description="No hay productos con stock bajo por ahora" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sinLeer.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Sin leer ({sinLeer.length})
              </h3>
              <ul className="flex flex-col gap-2">
                {sinLeer.map((n) => (
                  <AlertRow key={n._id} notificacion={n} onMarcarLeida={marcarLeida} />
                ))}
              </ul>
            </div>
          )}

          {leidas.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Leídas ({leidas.length})
              </h3>
              <ul className="flex flex-col gap-2">
                {leidas.map((n) => (
                  <AlertRow key={n._id} notificacion={n} onMarcarLeida={marcarLeida} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AlertRow({ notificacion, onMarcarLeida }) {
  const esSinStock = notificacion.tipo === 'sin_stock'
  const Icon = esSinStock ? PackageX : TriangleAlert

  return (
    <li
      className={`flex items-start gap-3 rounded-xl bg-card p-4 ring-1 ring-hairline ${
        notificacion.leida ? 'opacity-60' : ''
      }`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${esSinStock ? 'bg-critical/10 text-critical' : 'bg-warning/15 text-[#8a5a00] dark:text-warning'}`}>
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={esSinStock ? 'critical' : 'warning'}>{esSinStock ? 'Sin stock' : 'Stock bajo'}</Badge>
          <span className="text-xs text-ink-muted">{formatDateTime(notificacion.createdAt)}</span>
        </div>
        <p className="mt-1.5 text-sm text-ink">{notificacion.mensaje}</p>
      </div>
      {!notificacion.leida && (
        <button
          type="button"
          onClick={() => onMarcarLeida(notificacion._id)}
          className="btn-secondary shrink-0 px-2.5! py-1.5! text-xs"
        >
          <Check size={14} />
          Marcar leída
        </button>
      )}
    </li>
  )
}
