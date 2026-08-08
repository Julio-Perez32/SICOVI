import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargarSesion = useCallback(async () => {
    try {
      const data = await apiFetch('/auth/me')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarSesion()
  }, [cargarSesion])

  async function login(email, password) {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } })
    setUser(data.user)
    return data.user
  }

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, cargando, login, logout, recargarSesion: cargarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
