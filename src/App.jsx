//aquí definimos rutas
//decide que pag se muestra según la url
//si estamos en /login se muestra LoginPage

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import AppShell from '@/components/layout/AppShell'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import SettingsPage from '@/pages/SettingsPage'
import { SidebarProvider } from '@/context/SidebarContext'
import ProfilePages from '@/pages/ProfilePages'
import MisCafesPage from '@/pages/MisCafesPage'
import MapaPage from '@/pages/MapaPage'
import UserProfilePage from '@/pages/UserProfilePage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <AppShell>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePages />} />
                <Route path="/cafes" element={<MisCafesPage />} />
                <Route path="/map" element={<MapaPage />} />
                <Route path="/user/:username" element={<UserProfilePage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <SidebarProvider>
            <AppRoutes />
          </SidebarProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
