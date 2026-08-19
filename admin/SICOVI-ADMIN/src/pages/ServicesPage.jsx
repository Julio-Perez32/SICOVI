import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import Aviso from '../components/Aviso'
import { formatCurrency } from '../lib/format'
import { apiFetch } from '../lib/api'

const emptyForm = { codigo: '', nombre: '', descripcion: '', precio: '', duracionMinutos: '' }

function formatDuracion(minutos) {
  if (!minutos) return '—'
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto ? `${horas} h ${resto} min` : `${horas} h`
}

export default function ServicesPage() {
  const [servicios, setServicios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorLista, setErrorLista] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const idTimer = setTimeout(() => cargarServicios(), 250)
    return () => clearTimeout(idTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda])

  async function cargarServicios() {
    setCargando(true)
    setErrorLista('')
    try {
      const params = new URLSearchParams()
      if (busqueda) params.set('buscar', busqueda)
      const data = await apiFetch(`/services?${params.toString()}`)
      setServicios(data.servicios)
    } catch (err) {
      setErrorLista(err.message)
    } finally {
      setCargando(false)
    }
  }

  function abrirNuevo() {
    setEditId(null)
    setForm(emptyForm)
    setErrorForm('')
    setModalOpen(true)
  }

  function abrirEditar(servicio) {
    setEditId(servicio._id)
    setForm({
      codigo: servicio.codigo,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precio: servicio.precio,
      duracionMinutos: servicio.duracionMinutos ?? '',
    })
    setErrorForm('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorForm('')
    setGuardando(true)
    try {
      const payload = {
        codigo: form.codigo,
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        duracionMinutos: form.duracionMinutos === '' ? null : Number(form.duracionMinutos),
      }

      if (editId) {
        await apiFetch(`/services/${editId}`, { method: 'PUT', body: payload })
      } else {
        await apiFetch('/services', { method: 'POST', body: payload })
      }
      setModalOpen(false)
      await cargarServicios()
    } catch (err) {
      setErrorForm(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function handleDesactivar(servicio) {
    if (!confirm(`¿Desactivar "${servicio.nombre}"?`)) return
    try {
      await apiFetch(`/services/${servicio._id}`, { method: 'DELETE' })
      await cargarServicios()
    } catch (err) {
      setErrorLista(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Servicios"
        description={`${servicios.length} servicios de mano de obra que puede cobrar el taller`}
        action={
          <button type="button" onClick={abrirNuevo} className="btn-primary">
            <Plus size={16} />
            Nuevo servicio
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="field-input pl-9"
          />
        </div>
      </div>

      <Aviso mensaje={errorLista} onCerrar={() => setErrorLista('')} className="mb-4" />

      <div className="table-shell">
        {cargando ? (
          <EmptyState title="Cargando servicios..." />
        ) : servicios.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Sin servicios"
            description="Crea el primero para poder cobrarlo en la facturación"
          />
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th className="th">Servicio</th>
                <th className="th">Descripción</th>
                <th className="th">Duración</th>
                <th className="th text-right">Precio</th>
                <th className="th">Estado</th>
                <th className="th"></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s._id} className="hover:bg-ink/[0.02]">
                  <td className="td">
                    <p className="font-medium text-ink">{s.nombre}</p>
                    <p className="text-xs text-ink-muted">{s.codigo}</p>
                  </td>
                  <td className="td max-w-xs text-ink-soft">{s.descripcion || '—'}</td>
                  <td className="td text-ink-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={13} className="text-ink-muted" />
                      {formatDuracion(s.duracionMinutos)}
                    </span>
                  </td>
                  <td className="td text-right tabular-nums font-medium">{formatCurrency(s.precio)}</td>
                  <td className="td">
                    <Badge tone={s.activo ? 'good' : 'neutral'}>{s.activo ? 'Activo' : 'Inactivo'}</Badge>
                  </td>
                  <td className="td">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => abrirEditar(s)} className="btn-icon" aria-label="Editar">
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDesactivar(s)}
                        className="btn-icon hover:bg-critical/10! hover:text-critical!"
                        aria-label="Desactivar"
                      >
                        <Trash2 size={15} />
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Editar servicio' : 'Nuevo servicio'}
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" form="service-form" disabled={guardando} className="btn-primary">
              {guardando ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear servicio'}
            </button>
          </>
        }
      >
        <form id="service-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Aviso mensaje={errorForm} className="sm:col-span-2" />

          <div>
            <label className="field-label" htmlFor="codigo">Código</label>
            <input
              id="codigo"
              className="field-input"
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="SRV001"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="precio">Precio</label>
            <input
              id="precio"
              type="number"
              step="0.01"
              min="0"
              className="field-input"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="nombre">Nombre del servicio</label>
            <input
              id="nombre"
              className="field-input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Cambio de aceite y filtro"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              rows={2}
              className="field-textarea"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Qué incluye la mano de obra"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="duracion">Duración aproximada (minutos)</label>
            <input
              id="duracion"
              type="number"
              min="0"
              className="field-input"
              value={form.duracionMinutos}
              onChange={(e) => setForm({ ...form, duracionMinutos: e.target.value })}
              placeholder="30"
            />
          </div>

          <p className="sm:col-span-2 text-xs text-ink-muted">
            Los servicios son mano de obra: no llevan stock ni precio de costo, así que cuentan como ganancia
            completa en el dashboard.
          </p>
        </form>
      </Modal>
    </div>
  )
}
