import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

const INTERVALO_MS = 20000 // cada 20s se fija si hay alertas nuevas, sin recargar la página

// Cuántas alertas de stock sin leer hay -- lo usan el Sidebar (badge del
// menú) y el Topbar (campanita) de forma independiente.
export default function useUnreadAlerts() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let activo = true

    function consultar() {
      apiFetch('/notifications?leida=false')
        .then((data) => {
          if (activo) setCount(data.count || 0)
        })
        .catch(() => {})
    }

    consultar()
    const idIntervalo = setInterval(consultar, INTERVALO_MS)

    return () => {
      activo = false
      clearInterval(idIntervalo)
    }
  }, [])

  return count
}
