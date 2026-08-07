import { Routes, Route, Navigate } from 'react-router-dom'
import EmployeeLayout from './layouts/EmployeeLayout'
import LoginPage from './pages/LoginPage'
import SellPage from './pages/SellPage'
import MySalesPage from './pages/MySalesPage'
import AccountPage from './pages/AccountPage'

// Nota: esto es solo la interfaz navegable, todavía sin conectar al
// backend -- no hay verificación real de sesión todavía.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<EmployeeLayout />}>
        <Route path="/" element={<SellPage />} />
        <Route path="/ventas" element={<MySalesPage />} />
        <Route path="/cuenta" element={<AccountPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
