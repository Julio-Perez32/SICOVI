import { X, Download, Printer } from 'lucide-react'
import { taller } from '../config/taller'
import { logoOdm } from '../assets/logoOdm'
import { formatCurrency } from '../lib/format'
import { generarComprobantePdf } from '../lib/receiptPdf'

// Vista en pantalla de la orden de servicio, con la misma estructura que el
// PDF (encabezado de ODM, nombre/vehículo/fecha, las 4 columnas y el total).
export default function ReceiptModal({ venta, onClose }) {
  if (!venta) return null

  const items = venta.items || []
  const f = new Date(venta.fecha)
  const fecha = [
    String(f.getDate()).padStart(2, '0'),
    String(f.getMonth() + 1).padStart(2, '0'),
    String(f.getFullYear()),
  ]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
      />

      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-hairline">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
          {/* Encabezado */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              {logoOdm ? (
                <img src={logoOdm} alt={taller.nombre} className="h-14 w-auto" />
              ) : (
                <p className="text-3xl font-bold leading-none text-ink">{taller.nombre}</p>
              )}
              <p className="mt-1.5 text-xs font-semibold tracking-wide text-ink-soft">{taller.subtitulo}</p>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold leading-tight text-ink">
                ORDEN DE
                <br />
                SERVICIO
              </p>
              <div className="mt-2 inline-block overflow-hidden rounded ring-1 ring-ink/80">
                <p className="bg-ink px-3 py-1 text-[10px] font-bold tracking-wide text-card">ORDEN NO.</p>
                <p className="px-3 py-1.5 text-base font-bold tabular-nums text-ink">
                  {venta.numeroComprobante || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Nombre / vehículo / fecha */}
          <div className="grid grid-cols-1 overflow-hidden rounded ring-1 ring-ink/80 sm:grid-cols-[1fr_auto]">
            <div className="divide-y divide-ink/20">
              <div className="flex items-baseline gap-2 px-3 py-2">
                <span className="text-xs font-bold text-ink">NOMBRE:</span>
                <span className="text-sm text-ink">{venta.cliente || 'Consumidor final'}</span>
              </div>
              <div className="flex items-baseline gap-2 px-3 py-2">
                <span className="text-xs font-bold text-ink">VEHICULO:</span>
                <span className="text-sm text-ink">{venta.vehiculo || '—'}</span>
              </div>
            </div>

            <div className="border-t border-ink/20 sm:border-l sm:border-t-0">
              <p className="bg-ink px-3 py-2 text-center text-xs font-bold tracking-wide text-card">FECHA</p>
              <div className="flex divide-x divide-ink/20">
                {fecha.map((parte, i) => (
                  <span key={i} className="min-w-[3rem] px-3 py-2 text-center text-sm tabular-nums text-ink">
                    {parte}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Detalle */}
          <div className="mt-5 overflow-x-auto scroll-thin rounded ring-1 ring-ink/20">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="bg-ink text-card">
                  <th className="px-3 py-2 text-center text-[11px] font-bold tracking-wide">CANTIDAD</th>
                  <th className="px-3 py-2 text-left text-[11px] font-bold tracking-wide">DESCRIPCIÓN</th>
                  <th className="px-3 py-2 text-right text-[11px] font-bold tracking-wide">VALOR UNITARIO</th>
                  <th className="px-3 py-2 text-right text-[11px] font-bold tracking-wide">IMPORTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/15">
                {items.map((it, i) => (
                  <tr key={`${it.tipo || 'producto'}-${it.codigo}-${i}`}>
                    <td className="px-3 py-2 text-center tabular-nums text-ink">{it.cantidad}</td>
                    <td className="px-3 py-2 text-ink">{it.nombre}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink">
                      {formatCurrency(it.precioVentaUnitario)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-ink">{formatCurrency(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mt-3 flex justify-end">
            <div className="flex items-stretch overflow-hidden rounded ring-1 ring-ink/20">
              <span className="bg-ink px-6 py-2.5 text-lg font-bold text-card">TOTAL</span>
              <span className="min-w-[7rem] px-4 py-2.5 text-right text-lg font-semibold tabular-nums text-ink">
                {formatCurrency(venta.total)}
              </span>
            </div>
          </div>

          <p className="mt-4 text-center text-xs font-bold tracking-wide text-ink">{taller.notaPrecios}</p>

          {/* Pie */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-hairline pt-4 text-center">
            <div>
              <p className="text-[10px] font-bold tracking-wide text-ink-soft">DIRECCIÓN</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">{taller.direccion}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wide text-ink-soft">TELÉFONO</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">{taller.telefono}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wide text-ink-soft">REDES</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">{taller.redes}</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap justify-end gap-2 border-t border-hairline px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cerrar
          </button>
          <button type="button" onClick={() => generarComprobantePdf(venta, 'imprimir')} className="btn-secondary">
            <Printer size={16} />
            Imprimir
          </button>
          <button type="button" onClick={() => generarComprobantePdf(venta, 'descargar')} className="btn-primary">
            <Download size={16} />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
