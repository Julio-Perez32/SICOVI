// Tooltip compartido por las gráficas del dashboard -- estilo consistente
// con el resto de la UI (tokens de texto, nunca el color de la serie en el
// texto).
export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg bg-card px-3 py-2 text-xs ring-1 ring-hairline shadow-lg">
      {label && <p className="mb-1 font-medium text-ink">{label}</p>}
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={entry.dataKey || entry.name} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-ink-soft">{entry.name}:</span>
            <span className="font-medium text-ink">
              {formatter ? formatter(entry.value, entry) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
