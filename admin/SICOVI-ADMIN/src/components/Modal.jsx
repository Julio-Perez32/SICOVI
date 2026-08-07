import { X } from 'lucide-react'

// Modal genérico reutilizable para los formularios "nuevo/editar" de cada
// página. Sin lógica de guardado todavía -- solo abre/cierra.
export default function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  if (!open) return null

  const width = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <div className={`relative w-full ${width} rounded-2xl bg-card ring-1 ring-hairline shadow-2xl max-h-[90vh] overflow-y-auto scroll-thin`}>
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-hairline px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}
