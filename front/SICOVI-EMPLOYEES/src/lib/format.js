export function formatCurrency(value) {
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(value || 0)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('es-SV').format(value || 0)
}

export function formatDate(value, opts = { day: '2-digit', month: 'short' }) {
  return new Intl.DateTimeFormat('es-SV', opts).format(new Date(value))
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat('es-SV', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
    new Date(value)
  )
}
