import { useMemo, useState } from 'react'
import { Plus, Trash2, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { formatCurrency, formatDate } from '../lib/format'
import { purchases } from '../mock/purchases'
import { suppliers } from '../mock/suppliers'

const emptyRow = { codigo: '', descripcion: '', cantidad: '', precioUnitario: '' }

export default function PurchasesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [proveedor, setProveedor] = useState('')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [items, setItems] = useState([{ ...emptyRow }])

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0), 0),
    [items]
  )

  function abrirNueva() {
    setProveedor('')
    setNumeroDocumento('')
    setItems([{ ...emptyRow }])
    setModalOpen(true)
  }

  function actualizarItem(index, campo, valor) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [campo]: valor } : it)))
  }

  function agregarFila() {
    setItems((prev) => [...prev, { ...emptyRow }])
  }

  function quitarFila(index) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  return (
    <div>
      <PageHeader
        title="Compras"
        description="Entradas de mercadería registradas de los proveedores"
        action={
          <button type="button" onClick={abrirNueva} className="btn-primary">
            <Plus size={16} />
            Nueva compra
          </button>
        }
      />

      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              <th className="th">Proveedor</th>
              <th className="th">N° documento</th>
              <th className="th">Fecha</th>
              <th className="th text-right">Líneas</th>
              <th className="th text-right">Total</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p._id} className="hover:bg-ink/[0.02]">
                <td className="td font-medium text-ink">{p.proveedor.nombre}</td>
                <td className="td text-ink-soft">{p.numeroDocumento}</td>
                <td className="td text-ink-soft">{formatDate(p.fecha)}</td>
                <td className="td text-right tabular-nums">{p.items.length}</td>
                <td className="td text-right tabular-nums font-medium">{formatCurrency(p.total)}</td>
                <td className="td">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setDetalle(p)} className="btn-icon" aria-label="Ver detalle">
                      <Eye size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nueva compra */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva compra"
        description="Vista previa de formulario -- todavía no guarda datos reales"
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="purchase-form" className="btn-primary">Registrar compra</button>
          </>
        }
      >
        <form id="purchase-form" onSubmit={(e) => { e.preventDefault(); setModalOpen(false) }} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="proveedor">Proveedor</label>
              <select id="proveedor" className="field-select" value={proveedor} onChange={(e) => setProveedor(e.target.value)}>
                <option value="">Selecciona...</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="numeroDocumento">N° de documento</label>
              <input id="numeroDocumento" className="field-input" value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} placeholder="CFDTE0226 - 001544" />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="field-label mb-0!">Productos</span>
              <button type="button" onClick={agregarFila} className="btn-secondary px-2.5! py-1! text-xs">
                <Plus size={14} />
                Agregar línea
              </button>
            </div>

            <div className="overflow-x-auto scroll-thin rounded-lg ring-1 ring-hairline">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="th">Código</th>
                    <th className="th">Descripción</th>
                    <th className="th w-24">Cantidad</th>
                    <th className="th w-28">Precio</th>
                    <th className="th w-28 text-right">Subtotal</th>
                    <th className="th"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="td">
                        <input className="field-input" value={it.codigo} onChange={(e) => actualizarItem(i, 'codigo', e.target.value)} placeholder="VAL025" />
                      </td>
                      <td className="td">
                        <input className="field-input" value={it.descripcion} onChange={(e) => actualizarItem(i, 'descripcion', e.target.value)} placeholder="Descripción" />
                      </td>
                      <td className="td">
                        <input type="number" className="field-input" value={it.cantidad} onChange={(e) => actualizarItem(i, 'cantidad', e.target.value)} placeholder="0" />
                      </td>
                      <td className="td">
                        <input type="number" step="0.01" className="field-input" value={it.precioUnitario} onChange={(e) => actualizarItem(i, 'precioUnitario', e.target.value)} placeholder="0.00" />
                      </td>
                      <td className="td text-right tabular-nums">
                        {formatCurrency((Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0))}
                      </td>
                      <td className="td">
                        <button type="button" onClick={() => quitarFila(i)} className="btn-icon hover:bg-critical/10! hover:text-critical!" aria-label="Quitar línea">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end border-t border-hairline pt-3 text-sm">
            <span className="text-ink-soft">Total: </span>
            <span className="ml-2 font-semibold text-ink">{formatCurrency(total)}</span>
          </div>
        </form>
      </Modal>

      {/* Detalle de compra */}
      <Modal
        open={!!detalle}
        onClose={() => setDetalle(null)}
        title={detalle ? `Compra a ${detalle.proveedor.nombre}` : ''}
        description={detalle ? `${detalle.numeroDocumento} · ${formatDate(detalle.fecha)}` : ''}
        size="lg"
      >
        {detalle && (
          <div className="overflow-x-auto scroll-thin rounded-lg ring-1 ring-hairline">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="th">Código</th>
                  <th className="th">Descripción</th>
                  <th className="th text-right">Cantidad</th>
                  <th className="th text-right">Precio</th>
                  <th className="th text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalle.items.map((it) => (
                  <tr key={it.codigo}>
                    <td className="td text-ink-soft">{it.codigo}</td>
                    <td className="td">{it.descripcion}</td>
                    <td className="td text-right tabular-nums">{it.cantidad}</td>
                    <td className="td text-right tabular-nums">{formatCurrency(it.precioUnitario)}</td>
                    <td className="td text-right tabular-nums">{formatCurrency(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {detalle && (
          <div className="mt-3 flex justify-end text-sm">
            <span className="text-ink-soft">Total: </span>
            <span className="ml-2 font-semibold text-ink">{formatCurrency(detalle.total)}</span>
          </div>
        )}
      </Modal>
    </div>
  )
}
