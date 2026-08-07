import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import SuppliersPage from './pages/SuppliersPage'
import PurchasesPage from './pages/PurchasesPage'
import SalesPage from './pages/SalesPage'
import EmployeesPage from './pages/EmployeesPage'
import AlertsPage from './pages/AlertsPage'

// Nota: esto es solo la interfaz navegable, todavía sin conectar al
// backend -- no hay verificación real de sesión, por eso no hay rutas
// protegidas de verdad todavía.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/proveedores" element={<SuppliersPage />} />
        <Route path="/compras" element={<PurchasesPage />} />
        <Route path="/ventas" element={<SalesPage />} />
        <Route path="/empleados" element={<EmployeesPage />} />
        <Route path="/alertas" element={<AlertsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
