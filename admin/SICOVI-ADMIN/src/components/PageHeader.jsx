export default function PageHeader({ title, description, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  )
}
