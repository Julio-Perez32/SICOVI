import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useAuth } from '../context/AuthContext'

export default function EmployeeLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { user, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="grid h-screen place-items-center bg-page">
        <span className="flex items-center gap-2 text-sm text-ink-soft">
          <Wrench size={16} className="animate-pulse" />
          Cargando SICOVI...
        </span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-page">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto scroll-thin p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
