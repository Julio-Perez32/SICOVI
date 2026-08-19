import { TriangleAlert, CheckCircle2, X } from 'lucide-react'

const TONOS = {
  error: { clase: 'bg-critical/10 text-critical', icono: TriangleAlert },
  exito: { clase: 'bg-good/10 text-good', icono: CheckCircle2 },
}

// Aviso dentro de la página (en vez del alert() del navegador, que corta
// todo y se ve feo). Se usa para decirle al usuario qué pasó cuando una
// acción falla o sale bien.
export default function Aviso({ tono = 'error', mensaje, onCerrar, className = '' }) {
  if (!mensaje) return null

  const { clase, icono: Icono } = TONOS[tono] || TONOS.error

  return (
    <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${clase} ${className}`}>
      <Icono size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{mensaje}</span>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Cerrar aviso"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
