import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import { CLIENTS, ORDERS, fmtUSD, fmtDate } from '../data/mockData.js'
import { generateInvoice, nextInvoiceNumber, fmtCurrency, STATUS_CONFIG } from '../lib/invoiceUtils.js'
import './Invoices.css'

export default function Invoices() {
  const [invoices, setInvoices]       = useState([])
  const [selected, setSelected]       = useState(null)
  const [sending, setSending]         = useState(false)
  const [sendResult, setSendResult]   = useState(null)
  const [editingNotes, setEditingNotes] = useState(false)

  function handleGenerate(client) {
    const clientOrders = ORDERS.filter(o => o.clientId === client.id)
    const num = nextInvoiceNumber(invoices)
    const inv = generateInvoice(
      { ...client, billing_cycle_days: client.billingCycleDays },
      clientOrders.map(o => ({
        id: o.id,
        sku: o.sku,
        sku_name: o.skuName,
        quantity: o.quantity,
        destination: o.destination,
        shipping_cost: o.shippingCost,
        fulfillment_fee: o.fulfillmentFee,
      })),
      num
    )
    setInvoices(prev => [inv, ...prev])
    setSelected(inv)
    setSendResult(null)
  }

  function handleTogglePaid(inv) {
    const newStatus = inv.status === 'paid' ? 'sent' : 'paid'
    const updated = { ...inv, status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString() : null }
    setInvoices(prev => prev.map(i => i.id === inv.id ? updated : i))
    if (selected?.id === inv.id) setSelected(updated)
  }

  function handleUpdateNotes(inv, notes) {
    const updated = { ...inv, notes }
    setInvoices(prev => prev.map(i => i.id === inv.id ? updated : i))
    setSelected(updated)
    setEditingNotes(false)
  }

  async function handleSend(inv, client) {
    setSending(true)
    setSendResult(null)

    try {
      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice: inv, client }),
      })
      const data = await res.json()

      if (data.success) {
        const updated = { ...inv, status: 'sent', sent_at: new Date().toISOString() }
        setInvoices(prev => prev.map(i => i.id === inv.id ? updated : i))
        setSelected(updated)
        setSendResult({ ok: true, message: `Invoice sent to ${client.email}` })
      } else {
        setSendResult({ ok: false, message: data.error || 'Failed to send' })
      }
    } catch (err) {
      setSendResult({ ok: false, message: err.message })
    }

    setSending(false)
  }

  const selectedClient = selected
    ? CLIENTS.find(c => c.id === selected.client_id)
    : null

  return (
    <>
      <TopBar title="Invoices" subtitle={`${invoices.length} invoices this cycle`} />

      <div className="page-content">
        <div className="inv-layout">

          {/* Left — invoice list + generate */}
          <div className="inv-left">
            {/* Generate buttons per client */}
            <div className="inv-generate-section card">
              <span className="section-label" style={{ padding: '12px 16px', display: 'block', borderBottom: '1px solid var(--border)' }}>
                Generate Invoice
              </span>
              {CLIENTS.map(client => (
                <div key={client.id} className="inv-generate-row">
                  <div className="inv-generate-client">
                    <span className="inv-client-name">{client.name}</span>
                    <span className="inv-client-meta">
                      {ORDERS.filter(o => o.clientId === client.id).length} orders · {client.billingCycleDays}-day cycle
                    </span>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 11, padding: '6px 12px' }}
                    onClick={() => handleGenerate(client)}
                  >
                    Generate
                  </button>
                </div>
              ))}
            </div>

            {/* Invoice list */}
            <div className="inv-list">
              {invoices.length === 0 ? (
                <div className="inv-empty">
                  No invoices yet — generate one above
                </div>
              ) : (
                invoices.map(inv => {
                  const client = CLIENTS.find(c => c.id === inv.client_id)
                  const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft
                  return (
                    <div
                      key={inv.id}
                      className={`inv-list-item card${selected?.id === inv.id ? ' inv-list-item--active' : ''}`}
                      onClick={() => { setSelected(inv); setSendResult(null) }}
                    >
                      <div className="inv-list-top">
                        <span className="mono inv-number">{inv.invoice_number}</span>
                        <span
                          className="inv-status-badge"
                          style={{ color: cfg.color, background: cfg.bg }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="inv-list-bottom">
                        <span className="inv-list-client">{client?.name}</span>
                        <span className="mono inv-list-total">{fmtCurrency(inv.total_due)}</span>
                      </div>
                      <div className="inv-list-period">{inv.period_label}</div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right — invoice detail */}
          <div className="inv-right">
            {!selected ? (
              <div className="inv-placeholder card">
                <span className="inv-placeholder-icon">📄</span>
                <span className="inv-placeholder-text">Select or generate an invoice to preview it</span>
              </div>
            ) : (
              <InvoiceDetail
                invoice={selected}
                client={selectedClient}
                onTogglePaid={() => handleTogglePaid(selected)}
                onSend={() => handleSend(selected, selectedClient)}
                onUpdateNotes={(notes) => handleUpdateNotes(selected, notes)}
                sending={sending}
                sendResult={sendResult}
                editingNotes={editingNotes}
                setEditingNotes={setEditingNotes}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function InvoiceDetail({ invoice, client, onTogglePaid, onSend, onUpdateNotes, sending, sendResult, editingNotes, setEditingNotes }) {
  const [notesVal, setNotesVal] = useState(invoice.notes ?? '')
  const cfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.draft

  return (
    <div className="inv-detail card">
      {/* Invoice header */}
      <div className="inv-detail-header">
        <div className="inv-detail-header-left">
          <span className="mono inv-detail-number">{invoice.invoice_number}</span>
          <span className="inv-detail-period">{invoice.period_label}</span>
        </div>
        <div className="inv-detail-header-right">
          <span className="inv-status-badge inv-status-badge--lg" style={{ color: cfg.color, background: cfg.bg }}>
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="inv-detail-divider" />

      {/* Bill to */}
      <div className="inv-bill-row">
        <div className="inv-bill-block">
          <span className="inv-bill-label">Bill To</span>
          <span className="inv-bill-name">{client?.name}</span>
          <span className="inv-bill-sub">{client?.contact}</span>
          <span className="inv-bill-sub">{client?.email}</span>
        </div>
        <div className="inv-bill-block" style={{ textAlign: 'right' }}>
          <span className="inv-bill-label">From</span>
          <span className="inv-bill-name">Rover Fulfillment LLC</span>
          <span className="inv-bill-sub">nick@rover-fulfillment.com</span>
          <span className="inv-bill-sub">Chantilly, Virginia</span>
        </div>
      </div>

      {/* Totals row */}
      <div className="inv-totals-row">
        <div className="inv-total-box">
          <span className="inv-total-label">Orders</span>
          <span className="mono inv-total-val">{invoice.orders.length}</span>
        </div>
        <div className="inv-total-box">
          <span className="inv-total-label">Shipping</span>
          <span className="mono inv-total-val">{fmtCurrency(invoice.total_shipping)}</span>
        </div>
        <div className="inv-total-box">
          <span className="inv-total-label">Fulfillment</span>
          <span className="mono inv-total-val">{fmtCurrency(invoice.total_fulfillment)}</span>
        </div>
        {invoice.total_storage > 0 && (
          <div className="inv-total-box">
            <span className="inv-total-label">Storage</span>
            <span className="mono inv-total-val">{fmtCurrency(invoice.total_storage)}</span>
          </div>
        )}
        <div className="inv-total-box inv-total-box--accent">
          <span className="inv-total-label">Total Due</span>
          <span className="mono inv-total-val">{fmtCurrency(invoice.total_due)}</span>
        </div>
      </div>

      {/* Orders table */}
      <div className="inv-orders-wrap">
        <table className="inv-orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>SKU</th>
              <th className="align-right">Qty</th>
              <th>Destination</th>
              <th className="align-right">Shipping</th>
              <th className="align-right">Fee</th>
              <th className="align-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.orders.map(o => (
              <tr key={o.id}>
                <td><span className="mono" style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>{o.id}</span></td>
                <td>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>{o.sku}</span>
                  <span style={{ fontSize: 12 }}>{o.sku_name}</span>
                </td>
                <td className="align-right"><span className="mono">{o.quantity}</span></td>
                <td><span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{o.destination}</span></td>
                <td className="align-right"><span className="mono">{fmtCurrency(o.shipping_cost)}</span></td>
                <td className="align-right"><span className="mono" style={{ color: 'var(--text-muted)' }}>{fmtCurrency(o.fulfillment_fee)}</span></td>
                <td className="align-right"><span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>{fmtCurrency(Number(o.shipping_cost) + Number(o.fulfillment_fee))}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment info */}
      <div className="inv-payment-info">
        <span className="section-label">Payment</span>
        <span className="inv-payment-text">
          ACH Wire Transfer or Zelle · Due within {client?.billingCycleDays ?? 15} days
        </span>
      </div>

      {/* Notes */}
      <div className="inv-notes-section">
        <div className="inv-notes-header">
          <span className="section-label">Notes</span>
          <button className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => setEditingNotes(e => !e)}>
            {editingNotes ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {editingNotes ? (
          <div className="inv-notes-edit">
            <textarea
              className="inv-notes-textarea"
              value={notesVal}
              onChange={e => setNotesVal(e.target.value)}
              placeholder="Add notes to this invoice..."
              rows={3}
            />
            <button className="btn btn-primary" style={{ fontSize: 11, alignSelf: 'flex-end' }} onClick={() => onUpdateNotes(notesVal)}>
              Save Notes
            </button>
          </div>
        ) : (
          <span className="inv-notes-text">{invoice.notes || 'No notes.'}</span>
        )}
      </div>

      {/* Actions */}
      <div className="inv-actions">
        <button
          className={`btn ${invoice.status === 'paid' ? 'btn-ghost' : 'btn-ghost'}`}
          onClick={onTogglePaid}
          style={{ color: invoice.status === 'paid' ? 'var(--shipped)' : 'var(--text-sub)' }}
        >
          {invoice.status === 'paid' ? '✓ Mark Unpaid' : 'Mark as Paid'}
        </button>

        <button
          className="btn btn-primary"
          onClick={onSend}
          disabled={sending || invoice.status === 'paid'}
        >
          {sending ? 'Sending...' : invoice.status === 'sent' ? 'Resend Invoice' : 'Send Invoice'}
        </button>
      </div>

      {sendResult && (
        <div className={`inv-send-result ${sendResult.ok ? 'inv-send-result--ok' : 'inv-send-result--err'}`}>
          {sendResult.message}
        </div>
      )}
    </div>
  )
}
