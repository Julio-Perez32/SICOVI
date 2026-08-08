import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CalendarRange, Eye, TriangleAlert } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { formatCurrency, formatDateTime } from '../lib/format'
import { apiFetch } from '../lib/api'

const METODOS = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', otro: 'Otro' }

function inicioDelDia(offsetDias = 0) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - offsetDias)
  return d
}

export default function MySalesPage() {
  const [sales, setSales] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')
  const [detalle, setDetalle] = useState(null)

  useEffect(() => {
    cargarVentas()
  }, [])

  async function cargarVentas() {
    setCargando(true)
    setErrorLista('')
    try {
      const data = await apiFetch('/sales')
      setSales(data.ventas)
    } catch (err) {
      setErrorLista(err.message)
    } finally {
      setCargando(false)
    }
  }

  const stats = useMemo(() => {
    const activas = sales.filter((v) => !v.anulada)
    const hoyDesde = inicioDelDia(0)
    const semanaDesde = inicioDelDia(6)
    const deHoy = activas.filter((v) => new Date(v.fecha) >= hoyDesde)
    const deLaSemana = activas.filter((v) => new Date(v.fecha) >= semanaDesde)
    const sumar = (arr) => arr.reduce((acc, v) => acc + v.total, 0)
    return {
      hoy: { cantidad: deHoy.length, total: sumar(deHoy) },
      semana: { cantidad: deLaSemana.length, total: sumar(deLaSemana) },
    }
  }, [sales])

  return (
    <div>
      <PageHeader title="Ventas" description="Historial de ventas registradas desde esta terminal" />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={CalendarDays}
          label="Ventas de hoy"
          value={formatCurrency(stats.hoy.total)}
          hint={`${stats.hoy.cantidad} ventas`}
          tone="good"
        />
        <StatCard
          icon={CalendarRange}
          label="Ventas de los últimos 7 días"
          value={formatCurrency(stats.semana.total)}
          hint={`${stats.semana.cantidad} ventas`}
        />
      </div>

      {errorLista && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
          <TriangleAlert size={16} />
          {errorLista}
        </div>
      )}

      <div className="table-shell">
        {cargando ? (
          <EmptyState title="Cargando ventas..." />
        ) : sales.length === 0 ? (
          <EmptyState title="Sin ventas todavía" description="Las que registres en Vender aparecen aquí" />
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Fecha</th>
                <th className="th">Cliente</th>
                <th className="th">Método</th>
                <th className="th text-right">Líneas</th>
                <th className="th text-right">Total</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((v) => (
                <tr key={v._id} className="hover:bg-ink/[0.02]">
                  <td className="td text-ink-soft">{formatDateTime(v.fecha)}</td>
                  <td className="td text-ink">{v.cliente || '—'}</td>
                  <td className="td text-ink-soft">{METODOS[v.metodoPago] || v.metodoPago}</td>
                  <td className="td text-right tabular-nums">{v.items.length}</td>
                  <td className="td text-right tabular-nums font-medium">{formatCurrency(v.total)}</td>
                  <td className="td">
                    <div className="flex justify-end">
                      <button type="button" onClick={() => setDetalle(v)} className="btn-icon" aria-label="Ver detalle">
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={!!detalle}
        onClose={() => setDetalle(null)}
        title="Detalle de la venta"
        description={detalle ? `${formatDateTime(detalle.fecha)} · ${detalle.cliente || 'Consumidor final'}` : ''}
        size="lg"
      >
        {detalle && (
          <>
            <div className="overflow-x-auto scroll-thin rounded-lg ring-1 ring-hairline">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="th">Producto</th>
                    <th className="th text-right">Cantidad</th>
                    <th className="th text-right">Precio</th>
                    <th className="th text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.items.map((it) => (
                    <tr key={it.codigo}>
                      <td className="td">
                        <p>{it.nombre}</p>
                        <p className="text-xs text-ink-muted">{it.codigo}</p>
                      </td>
                      <td className="td text-right tabular-nums">{it.cantidad}</td>
                      <td className="td text-right tabular-nums">{formatCurrency(it.precioVentaUnitario)}</td>
                      <td className="td text-right tabular-nums">{formatCurrency(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <Badge tone="accent">{METODOS[detalle.metodoPago] || detalle.metodoPago}</Badge>
              <div>
                <span className="text-ink-soft">Total: </span>
                <span className="ml-2 font-semibold text-ink">{formatCurrency(detalle.total)}</span>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
