import { storageDaysRemaining, storageProgressPct, palletsUsed, totalCases } from '../lib/utils.js'
import './StorageCard.css'

export default function StorageCard({ client }) {
  const daysLeft       = storageDaysRemaining(client)
  const pct            = storageProgressPct(client)
  const pallets        = palletsUsed(client)
  const cases          = totalCases(client)
  const isExpiringSoon = daysLeft <= 14
  const isExpired      = daysLeft <= 0

  const urgencyClass = isExpired
    ? 'storage--expired'
    : isExpiringSoon
    ? 'storage--warning'
    : 'storage--ok'

  return (
    <div className={`storage-card card ${urgencyClass}`}>
      <div className="storage-header">
        <div className="storage-header-left">
          <span className="section-label">Storage</span>
          <span className="storage-client">{client.name}</span>
        </div>
        <div className="storage-days-badge">
          <span className="days-num mono">{Math.max(0, daysLeft)}</span>
          <span className="days-label">days free</span>
        </div>
      </div>

      <div className="storage-progress-wrap">
        <div className="storage-progress-bar">
          <div
            className="storage-progress-fill"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="storage-progress-labels">
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {client.storage_start ?? '—'}
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {client.storage_free_end ?? '—'}
          </span>
        </div>
      </div>

      <div className="storage-stats">
        <div className="storage-stat">
          <span className="mono storage-stat-val">{cases}</span>
          <span className="storage-stat-label">cases</span>
        </div>
        <div className="storage-stat">
          <span className="mono storage-stat-val">{pallets}</span>
          <span className="storage-stat-label">pallets</span>
        </div>
        <div className="storage-stat">
          <span className="mono storage-stat-val">${client.storage_cost_per_pallet ?? 20}/mo</span>
          <span className="storage-stat-label">per pallet</span>
        </div>
      </div>

      {isExpired && (
        <div className="storage-alert">
          ⚠ Free period ended — billing active at ${client.storage_cost_per_pallet ?? 20}/pallet/mo
        </div>
      )}
      {isExpiringSoon && !isExpired && (
        <div className="storage-alert storage-alert--warn">
          Free storage expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
