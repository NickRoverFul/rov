import './StatusBadge.css'

const STATUS_CONFIG = {
  pending:              { label: 'PENDING',    cls: 'badge--pending' },
  printed:              { label: 'PRINTED',    cls: 'badge--printed' },
  shipped:              { label: 'SHIPPED',    cls: 'badge--shipped' },
  fulfilled_externally: { label: 'EXT. FULFIL', cls: 'badge--ext'    },
  needs_review:         { label: 'REVIEW',     cls: 'badge--error'   },
  error:                { label: 'ERROR',      cls: 'badge--error'   },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`status-badge ${config.cls}`}>
      <span className="badge-dot" />
      {config.label}
    </span>
  )
}
