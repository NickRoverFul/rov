import { fmtCurrency, STATUS_CONFIG } from '../lib/invoiceUtils.js'
import './ClientInvoices.css'

// In Session 5 these will be fetched from Supabase
// For now shows empty state with clear messaging
export default function ClientInvoices({ clientId }) {
  const invoices = [] // Will be: useEffect → supabase.from('invoices').select(*)

  return (
    <div className="ci-wrap">
      <div className="ci-header">
        <span className="section-label">Your Invoices</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          Sent every 15 days · Payment via ACH or Zelle
        </span>
      </div>

      {invoices.length === 0 ? (
        <div className="ci-empty card">
          <span className="ci-empty-icon">📄</span>
          <span className="ci-empty-title">No invoices yet</span>
          <span className="ci-empty-sub">
            Your first invoice will be generated at the end of your first billing cycle.
          </span>
        </div>
      ) : (
        <div className="ci-list">
          {invoices.map(inv => {
            const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft
            return (
              <div key={inv.id} className="ci-item card">
                <div className="ci-item-left">
                  <span className="mono ci-inv-num">{inv.invoice_number}</span>
                  <span className="ci-inv-period">{inv.period_label}</span>
                </div>
                <div className="ci-item-right">
                  <span className="mono ci-inv-total">{fmtCurrency(inv.total_due)}</span>
                  <span className="ci-inv-status" style={{ color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
