const TONES = {
  neutral: 'bg-ink/5 text-ink-soft ring-1 ring-inset ring-hairline',
  accent: 'bg-accent/10 text-accent ring-1 ring-inset ring-accent/20',
  good: 'bg-good/10 text-good ring-1 ring-inset ring-good/25',
  warning: 'bg-warning/15 text-[#8a5a00] ring-1 ring-inset ring-warning/30 dark:text-warning',
  critical: 'bg-critical/10 text-critical ring-1 ring-inset ring-critical/25',
}

// Pill de estado. El color nunca es la única señal: siempre va con texto.
export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
