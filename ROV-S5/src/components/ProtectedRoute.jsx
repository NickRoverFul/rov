import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, adminOnly = false }) {
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
        LOADING...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}
