import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function useCategories() {
  const [categories, setCategories] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    apiFetch('/categories')
      .then((data) => setCategories(data.categorias))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  return { categories, cargando }
}
