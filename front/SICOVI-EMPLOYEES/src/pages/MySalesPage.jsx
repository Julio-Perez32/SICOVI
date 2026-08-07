import { useState } from 'react'
import { CalendarDays, CalendarRange, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { formatCurrency, formatDateTime } from '../lib/format'
import { mySales, myStats } from '../mock/sales'

const METODOS = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', otro: 'Otro' }

export default function MySalesPage() {
  const [detalle, setDetalle] = useState(null)

  return (
    <div>
      <PageHeader title="Ventas" description="Historial de ventas registradas desde esta terminal" />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={CalendarDays}
          label="Ventas de hoy"
          value={formatCurrency(myStats.hoy.total)}
          hint={`${myStats.hoy.cantidad} ventas`}
          tone="good"
        />
        <StatCard
          icon={CalendarRange}
          label="Ventas de la semana"
          value={formatCurrency(myStats.semana.total)}
          hint={`${myStats.semana.cantidad} ventas`}
        />
      </div>

      <div className="table-shell">
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
            {mySales.map((v) => (
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
