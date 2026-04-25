import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Sidebar.css'

// ── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  orders: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="4.5" y1="5" x2="11.5" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="4.5" y1="8" x2="11.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="4.5" y1="11" x2="8.5" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  clients: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12 7c1.105 0 2 .895 2 2v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12 3.5c.828 0 1.5.672 1.5 1.5S12.828 6.5 12 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  invoices: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 1.5h10a1 1 0 011 1V14l-2-1-2 1-2-1-2 1-2-1V2.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="5.5" y1="5.5" x2="10.5" y2="5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="5.5" y1="10.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.929 2.929l1.414 1.414M11.657 11.657l1.414 1.414M2.929 13.071l1.414-1.414M11.657 4.343l1.414-1.414" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  lock: (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <rect x="1.5" y="4.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M3 4.5V3a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
}

const NAV_ITEMS = [
  { path: '/',        label: 'Dashboard', icon: 'dashboard', active: true },
  { path: '/orders',  label: 'Orders',    icon: 'orders',    active: true },
  { path: '/clients', label: 'Clients',   icon: 'clients',   active: true },
  { path: '/invoices',label: 'Invoices',  icon: 'invoices',  active: false, session: 4 },
  { path: '/settings',label: 'Settings',  icon: 'settings',  active: false, session: 5 },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <span className="logo-r">R</span>
        </div>
        <div className="logo-text">
          <span className="logo-rov">ROV</span>
          <span className="logo-sub">Rover Fulfillment</span>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Workspace</span>

        {NAV_ITEMS.map(item => {
          if (!item.active) {
            return (
              <div key={item.path} className="nav-item nav-item--locked">
                <span className="nav-icon">{Icons[item.icon]}</span>
                <span className="nav-label">{item.label}</span>
                <span className="nav-lock">{Icons.lock}</span>
              </div>
            )
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-item${isActive ? ' nav-item--active' : ''}`
              }
            >
              <span className="nav-icon">{Icons[item.icon]}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />
        <div className="sidebar-user">
          <span className="sidebar-user-email">{user?.email}</span>
          <button className="sidebar-signout" onClick={signOut}>Sign out</button>
        </div>
        <div className="sidebar-version">
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            ROV v0.2.0
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>
            Session 2
          </span>
        </div>
      </div>
    </aside>
  )
}
