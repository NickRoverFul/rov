import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Orders from './pages/Orders.jsx'
import Clients from './pages/Clients.jsx'
import ClientDashboard from './pages/ClientDashboard.jsx'

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
      }}>
        ROV LOADING...
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  if (profile?.role === 'client') {
    return (
      <div className="app-shell">
        <div className="main-area">
          <Routes>
            <Route path="/" element={<ClientDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/orders"  element={<Orders />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/login"   element={<Navigate to="/" replace />} />
          <Route path="*"        element={<NotFound />} />
        </Routes>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-ui)',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 48, color: 'var(--border-3)' }}>404</span>
      <span style={{ fontSize: 13, letterSpacing: '0.08em' }}>Page not found</span>
    </div>
  )
}
