import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import Aviso from '../components/Aviso'
import { formatCurrency, formatDate } from '../lib/format'
import { apiFetch } from '../lib/api'
import useSuppliers from '../hooks/useSuppliers'

const emptyRow = { codigo: '', descripcion: '', cantidad: '', precioUnitario: '', precioVenta: '' }

export default function PurchasesPage() {
  const [compras, setCompras] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')
  const [productos, setProductos] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [detalle, setDetalle] = useState(null)
  const [proveedor, setProveedor] = useState('')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [items, setItems] = useState([{ ...emptyRow }])
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  const { suppliers } = useSuppliers()

  useEffect(() => {
    cargarCompras()
  }, [])

  async function cargarCompras() {
    setCargando(true)
    setErrorLista('')
    try {
      const data = await apiFetch('/purchases')
      setCompras(data.compras)
    } catch (err) {
      setErrorLista(err.message)
    } finally {
      setCargando(false)
    }
  }

  async function cargarProductosParaCombobox() {
    try {
      const data = await apiFetch('/products?limite=100')
      setProductos(data.productos)
    } catch {
      setProductos([])
    }
  }

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0), 0),
    [items]
  )

  function esProductoNuevo(codigo) {
    if (!codigo) return false
    return !productos.some((p) => p.codigo.toLowerCase() === codigo.trim().toLowerCase())
  }

  function abrirNueva() {
    setProveedor('')
    setNumeroDocumento('')
    setItems([{ ...emptyRow }])
    setErrorForm('')
    setModalOpen(true)
    cargarProductosParaCombobox()
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

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorForm('')

    if (!proveedor) {
      setErrorForm('Selecciona un proveedor')
      return
    }
    const lineasValidas = items.filter((it) => it.codigo && it.cantidad && it.precioUnitario)
    if (lineasValidas.length === 0) {
      setErrorForm('Agrega al menos un producto con código, cantidad y precio')
      return
    }
    const faltaPrecioVenta = lineasValidas.find((it) => esProductoNuevo(it.codigo) && !it.precioVenta)
    if (faltaPrecioVenta) {
      setErrorForm(`Falta el precio de venta para el producto nuevo "${faltaPrecioVenta.codigo}"`)
      return
    }

    setGuardando(true)
    try {
      const payload = {
        proveedor,
        numeroDocumento,
        items: lineasValidas.map((it) => ({
          codigo: it.codigo,
          descripcion: it.descripcion,
          cantidad: Number(it.cantidad),
          precioUnitario: Number(it.precioUnitario),
          ...(esProductoNuevo(it.codigo) ? { precioVenta: Number(it.precioVenta) } : {}),
        })),
      }
      await apiFetch('/purchases', { method: 'POST', body: payload })
      setModalOpen(false)
      await cargarCompras()
    } catch (err) {
      setErrorForm(err.message)
    } finally {
      setGuardando(false)
    }
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

      <Aviso mensaje={errorLista} className="mb-4" />

      <div className="table-shell">
        {cargando ? (
          <EmptyState title="Cargando compras..." />
        ) : compras.length === 0 ? (
          <EmptyState title="Sin compras" description="Registra la primera entrada de mercadería" />
        ) : (
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
              {compras.map((p) => (
                <tr key={p._id} className="hover:bg-ink/[0.02]">
                  <td className="td font-medium text-ink">{p.proveedor?.nombre || '—'}</td>
                  <td className="td text-ink-soft">{p.numeroDocumento || '—'}</td>
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
        )}
      </div>

      {/* Nueva compra */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva compra"
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="purchase-form" disabled={guardando} className="btn-primary">
              {guardando ? 'Registrando...' : 'Registrar compra'}
            </button>
          </>
        }
      >
        <form id="purchase-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Aviso mensaje={errorForm} />

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
                    <th className="th w-28">Precio costo</th>
                    <th className="th w-28">Precio venta</th>
                    <th className="th w-28 text-right">Subtotal</th>
                    <th className="th"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const esNuevo = esProductoNuevo(it.codigo)
                    return (
                      <tr key={i}>
                        <td className="td">
                          <input className="field-input" value={it.codigo} onChange={(e) => actualizarItem(i, 'codigo', e.target.value)} placeholder="VAL025" />
                        </td>
                        <td className="td">
                          <input className="field-input" value={it.descripcion} onChange={(e) => actualizarItem(i, 'descripcion', e.target.value)} placeholder="Descripción" />
                        </td>
                        <td className="td">
                          <input type="number" min="0" className="field-input" value={it.cantidad} onChange={(e) => actualizarItem(i, 'cantidad', e.target.value)} placeholder="0" />
                        </td>
                        <td className="td">
                          <input type="number" step="0.01" min="0" className="field-input" value={it.precioUnitario} onChange={(e) => actualizarItem(i, 'precioUnitario', e.target.value)} placeholder="0.00" />
                        </td>
                        <td className="td">
                          {esNuevo ? (
                            <input type="number" step="0.01" min="0" className="field-input" value={it.precioVenta} onChange={(e) => actualizarItem(i, 'precioVenta', e.target.value)} placeholder="0.00" />
                          ) : (
                            <span className="text-xs text-ink-muted">existente</span>
                          )}
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
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              Si el código no existe todavía en el inventario, se crea el producto -- por eso pide precio de venta.
            </p>
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
        title={detalle ? `Compra a ${detalle.proveedor?.nombre || ''}` : ''}
        description={detalle ? `${detalle.numeroDocumento || 'Sin N° de documento'} · ${formatDate(detalle.fecha)}` : ''}
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
