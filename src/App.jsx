import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Orders from './pages/Orders.jsx'
import Clients from './pages/Clients.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/orders"  element={<Orders />} />
          <Route path="/clients" element={<Clients />} />
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
