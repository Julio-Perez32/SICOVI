import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function useSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    apiFetch('/suppliers')
      .then((data) => setSuppliers(data.proveedores))
      .catch(() => {})
      .finally(() => setCargando(false))
  }, [])

  return { suppliers, cargando }
}
