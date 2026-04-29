import { useState, useEffect } from 'react'
import './TopBar.css'

export default function TopBar({ title, subtitle, actions }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dateStr = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <span className="topbar-subtitle">{subtitle}</span>}
      </div>

      <div className="topbar-right">
        {actions && <div className="topbar-actions">{actions}</div>}
        <div className="topbar-clock">
          <span className="clock-date">{dateStr}</span>
          <span className="clock-time mono">{timeStr}</span>
        </div>
        <div className="topbar-status">
          <span className="status-dot status-dot--live" />
          <span className="status-label">LIVE</span>
        </div>
      </div>
    </header>
  )
}
