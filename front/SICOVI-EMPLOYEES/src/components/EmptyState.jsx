export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-ink/5 text-ink-muted">
          <Icon size={22} />
        </span>
      )}
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
    </div>
  )
}
