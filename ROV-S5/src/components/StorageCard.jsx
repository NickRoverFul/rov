import { storageDaysRemaining, storageProgressPct, palletsUsed, totalCases } from '../data/mockData.js'
import './StorageCard.css'

export default function StorageCard({ client }) {
  const daysLeft = storageDaysRemaining(client)
  const pct = storageProgressPct(client)
  const pallets = palletsUsed(client)
  const cases = totalCases(client)
  const isExpiringSoon = daysLeft <= 14
  const isExpired = daysLeft <= 0

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

      {/* Progress bar */}
      <div className="storage-bar-wrap">
        <div className="storage-bar-track">
          <div
            className="storage-bar-fill"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="storage-bar-labels">
          <span className="bar-label mono">{new Date(client.storageStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span className="bar-label bar-label--center">60 days free</span>
          <span className="bar-label mono">{new Date(client.storageFreeEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="storage-stats">
        <div className="storage-stat">
          <span className="stat-val mono">{cases}</span>
          <span className="stat-label">cases on hand</span>
        </div>
        <div className="stat-divider" />
        <div className="storage-stat">
          <span className="stat-val mono">{pallets}</span>
          <span className="stat-label">pallets</span>
        </div>
        <div className="stat-divider" />
        <div className="storage-stat">
          <span className="stat-val mono">
            {isExpired ? `$${(pallets * client.storageCostPerPallet).toFixed(0)}/mo` : '$0.00'}
          </span>
          <span className="stat-label">storage fee</span>
        </div>
        <div className="stat-divider" />
        <div className="storage-stat">
          <span className="stat-val mono">${client.storageCostPerPallet.toFixed(0)}</span>
          <span className="stat-label">per pallet/mo</span>
        </div>
      </div>

      {isExpiringSoon && !isExpired && (
        <div className="storage-alert storage-alert--warning">
          ⚠ Free storage expires in {daysLeft} days — billing starts{' '}
          {new Date(client.storageBillingStart).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </div>
      )}

      {isExpired && (
        <div className="storage-alert storage-alert--active">
          ● Storage billing active — ${(pallets * client.storageCostPerPallet).toFixed(2)}/month ({pallets} pallets)
        </div>
      )}
    </div>
  )
}
