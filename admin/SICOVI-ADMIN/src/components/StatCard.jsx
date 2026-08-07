const TONES = {
  default: 'bg-accent/10 text-accent',
  good: 'bg-good/10 text-good',
  warning: 'bg-warning/15 text-[#8a5a00] dark:text-warning',
  critical: 'bg-critical/10 text-critical',
}

// Tarjeta KPI del dashboard: valor grande + etiqueta + ícono en su propio
// círculo de color. El texto siempre va en tinta neutra (nunca del color
// del ícono/tono) para que el dato se lea igual de bien en cualquier tono.
export default function StatCard({ icon: Icon, label, value, hint, tone = 'default' }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-hairline p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        {Icon && (
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${TONES[tone]}`}>
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-ink tracking-tight" style={{ fontVariantNumeric: 'proportional-nums' }}>
        {value}
      </div>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </div>
  )
}
