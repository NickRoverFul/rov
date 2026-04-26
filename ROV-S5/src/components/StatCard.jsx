import './StatCard.css'

export default function StatCard({ label, value, sub, accent = false, mono = true }) {
  return (
    <div className={`stat-card card${accent ? ' stat-card--accent' : ''}`}>
      <span className="section-label">{label}</span>
      <span className={`stat-value${mono ? ' mono' : ''}${accent ? ' stat-value--accent' : ''}`}>
        {value}
      </span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}
