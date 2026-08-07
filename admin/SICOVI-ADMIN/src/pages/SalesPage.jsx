import { useMemo, useState } from 'react'
import { Eye, Ban } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { formatCurrency, formatDateTime } from '../lib/format'
import { sales } from '../mock/sales'
import { employees } from '../mock/employees'

const METODOS = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', otro: 'Otro' }

export default function SalesPage() {
  const [vendedorFiltro, setVendedorFiltro] = useState('')
  const [detalle, setDetalle] = useState(null)
  const vendedores = employees.filter((e) => e.rol === 'empleado')

  const ventasFiltradas = useMemo(() => {
    if (!vendedorFiltro) return sales
    return sales.filter((v) => v.vendedor._id === vendedorFiltro)
  }, [vendedorFiltro])

  return (
    <div>
      <PageHeader
        title="Ventas"
        description="Todas las ventas registradas por los empleados"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          className="field-select w-auto"
          value={vendedorFiltro}
          onChange={(e) => setVendedorFiltro(e.target.value)}
        >
          <option value="">Todos los vendedores</option>
          {vendedores.map((v) => (
            <option key={v._id} value={v._id}>{v.nombre}</option>
          ))}
        </select>
      </div>

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th className="th">Fecha</th>
              <th className="th">Vendedor</th>
              <th className="th">Cliente</th>
              <th className="th">Método</th>
              <th className="th text-right">Total</th>
              <th className="th">Estado</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.map((v) => (
              <tr key={v._id} className="hover:bg-ink/[0.02]">
                <td className="td text-ink-soft">{formatDateTime(v.fecha)}</td>
                <td className="td font-medium text-ink">{v.vendedor.nombre}</td>
                <td className="td text-ink-soft">{v.cliente || '—'}</td>
                <td className="td text-ink-soft">{METODOS[v.metodoPago] || v.metodoPago}</td>
                <td className="td text-right tabular-nums font-medium">{formatCurrency(v.total)}</td>
                <td className="td">
                  <Badge tone={v.anulada ? 'critical' : 'good'}>{v.anulada ? 'Anulada' : 'Activa'}</Badge>
                </td>
                <td className="td">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => setDetalle(v)} className="btn-icon" aria-label="Ver detalle">
                      <Eye size={15} />
                    </button>
                    {!v.anulada && (
                      <button type="button" className="btn-icon hover:bg-critical/10! hover:text-critical!" aria-label="Anular venta">
                        <Ban size={15} />
                      </button>
                    )}
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
        title={detalle ? `Venta de ${detalle.vendedor.nombre}` : ''}
        description={detalle ? `${formatDateTime(detalle.fecha)} · ${detalle.cliente || 'Consumidor final'}` : ''}
        size="lg"
      >
        {detalle && (
          <>
            {detalle.anulada && (
              <div className="mb-4 rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">
                Venta anulada{detalle.motivoAnulacion ? `: ${detalle.motivoAnulacion}` : ''}
              </div>
            )}
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
            <div className="mt-3 flex justify-end text-sm">
              <span className="text-ink-soft">Total: </span>
              <span className="ml-2 font-semibold text-ink">{formatCurrency(detalle.total)}</span>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
