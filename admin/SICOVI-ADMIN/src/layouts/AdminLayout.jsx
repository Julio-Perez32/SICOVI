import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
