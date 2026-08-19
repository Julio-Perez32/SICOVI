import { useEffect, useState } from 'react'
import { Eye, Ban } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import Aviso from '../components/Aviso'
import { formatCurrency, formatDateTime } from '../lib/format'
import { apiFetch } from '../lib/api'

const METODOS = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', transferencia: 'Transferencia', otro: 'Otro' }

export default function SalesPage() {
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

  async function handleAnular(venta) {
    const motivo = prompt(`¿Por qué se anula la venta de ${formatCurrency(venta.total)}?`, '')
    if (motivo === null) return
    try {
      await apiFetch(`/sales/${venta._id}/void`, { method: 'PATCH', body: { motivo } })
      await cargarVentas()
    } catch (err) {
      setErrorLista(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Ventas"
        description="Todas las ventas registradas desde la terminal de empleados"
      />

      <Aviso mensaje={errorLista} onCerrar={() => setErrorLista('')} className="mb-4" />

      <div className="table-shell">
        {cargando ? (
          <EmptyState title="Cargando ventas..." />
        ) : sales.length === 0 ? (
          <EmptyState title="Sin ventas todavía" description="Cuando el empleado registre una venta, aparece aquí" />
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">N° comprobante</th>
                <th className="th">Fecha</th>
                <th className="th">Cliente</th>
                <th className="th">Método</th>
                <th className="th text-right">Total</th>
                <th className="th">Estado</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((v) => (
                <tr key={v._id} className="hover:bg-ink/[0.02]">
                  <td className="td font-medium tabular-nums text-ink">{v.numeroComprobante || '—'}</td>
                  <td className="td text-ink-soft">{formatDateTime(v.fecha)}</td>
                  <td className="td font-medium text-ink">{v.cliente || '—'}</td>
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
                        <button
                          type="button"
                          onClick={() => handleAnular(v)}
                          className="btn-icon hover:bg-critical/10! hover:text-critical!"
                          aria-label="Anular venta"
                        >
                          <Ban size={15} />
                        </button>
                      )}
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
                    <tr key={`${it.tipo || 'producto'}-${it.codigo}`}>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <p>{it.nombre}</p>
                          {it.tipo === 'servicio' && <Badge tone="accent">Servicio</Badge>}
                        </div>
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
