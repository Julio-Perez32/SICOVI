import { useEffect, useState } from 'react'
import { PackageX, TriangleAlert, Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { formatDateTime } from '../lib/format'
import { apiFetch } from '../lib/api'

const INTERVALO_MS = 20000 // se refresca sola cada 20s, sin recargar la página

export default function AlertsPage() {
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')

  useEffect(() => {
    cargarNotificaciones()
    const idIntervalo = setInterval(() => cargarNotificaciones({ silencioso: true }), INTERVALO_MS)
    return () => clearInterval(idIntervalo)
  }, [])

  async function cargarNotificaciones({ silencioso = false } = {}) {
    if (!silencioso) setCargando(true)
    setErrorLista('')
    try {
      const data = await apiFetch('/notifications')
      setNotificaciones(data.notificaciones)
    } catch (err) {
      if (!silencioso) setErrorLista(err.message)
    } finally {
      if (!silencioso) setCargando(false)
    }
  }

  async function marcarLeida(id) {
    setNotificaciones((prev) => prev.map((n) => (n._id === id ? { ...n, leida: true } : n)))
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' })
    } catch {
      cargarNotificaciones() // si falló, volvemos a traer el estado real
    }
  }

  const sinLeer = notificaciones.filter((n) => !n.leida)
  const leidas = notificaciones.filter((n) => n.leida)

  return (
    <div>
      <PageHeader
        title="Alertas de stock"
        description="Avisos automáticos cuando un producto queda bajo o sin stock"
      />

      {errorLista && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
          <TriangleAlert size={16} />
          {errorLista}
        </div>
      )}

      {cargando ? (
        <div className="table-shell">
          <EmptyState title="Cargando alertas..." />
        </div>
      ) : notificaciones.length === 0 ? (
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
