import { useState } from 'react'
import StatusBadge from './StatusBadge.jsx'
import { fmtRelative, fmtUSD, fmtDate } from '../lib/utils.js'
import { supabase } from '../lib/supabase.js'
import './OrderTable.css'

const STATUS_FILTERS = [
  { value: 'all',     label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'printed', label: 'Printed' },
  { value: 'shipped', label: 'Shipped' },
]

export default function OrderTable({ orders: initialOrders, clients = [], limit, compact = false }) {
  const [orders, setOrders]           = useState(initialOrders)
  const [clientFilter, setClientFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Keep in sync when parent passes new orders (e.g. after refresh)
  // Only reset if the array identity changed (new fetch)
  useState(() => { setOrders(initialOrders) })

  const clientOptions = [
    { value: 'all', label: 'All Clients' },
    ...clients.map(c => ({ value: c.id, label: c.name })),
  ]

  const getClientName = (clientId) => {
    const c = clients.find(c => c.id === clientId)
    return c ? c.name : clientId
  }

  async function handleStatusChange(orderId, newStatus) {
    const updates = { status: newStatus }
    if (newStatus === 'shipped') updates.shipped_at = new Date().toISOString()
    await supabase.from('orders').update(updates).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o))
  }

  const filtered = orders
    .filter(o => clientFilter === 'all' || o.client_id === clientFilter)
    .filter(o => statusFilter === 'all' || o.status === statusFilter)
    .slice(0, limit ?? orders.length)

  const pending = orders.filter(o => o.status === 'pending').length
  const printed = orders.filter(o => o.status === 'printed').length
  const shipped = orders.filter(o => o.status === 'shipped').length

  return (
    <div className="order-table-wrap card">
      {/* Header */}
      <div className="ot-header">
        <div className="ot-filters">
          {clientOptions.map(f => (
            <button
              key={f.value}
              className={`filter-tab${clientFilter === f.value ? ' filter-tab--active' : ''}`}
              onClick={() => setClientFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
          <div className="ot-filters-divider" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-tab filter-tab--sm${statusFilter === f.value ? ' filter-tab--active' : ''}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ot-counts">
          <span className="count-item count--pending">
            <span className="count-num">{pending}</span> pending
          </span>
          <span className="count-sep" />
          <span className="count-item count--printed">
            <span className="count-num">{printed}</span> printed
          </span>
          <span className="count-sep" />
          <span className="count-item count--shipped">
            <span className="count-num">{shipped}</span> shipped
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="scroll-x">
        <table className="ot-table">
          <thead>
            <tr>
              <th>Order</th>
              {!compact && <th>Client</th>}
              <th>Customer</th>
              <th>SKU</th>
              <th className="align-right">Qty</th>
              <th>Destination</th>
              <th className="align-right">Shipping</th>
              <th className="align-right">Fee</th>
              <th>Status</th>
              <th>Date</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={compact ? 9 : 10} className="ot-empty">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              filtered.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  clientName={getClientName(order.client_id)}
                  compact={compact}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OrderRow({ order, clientName, compact, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [pushing, setPushing]   = useState(false)
  const [pushResult, setPushResult] = useState(null) // { ok, message }

  async function handlePushToSE(e) {
    e.stopPropagation()
    setPushing(true)
    setPushResult(null)
    try {
      const res  = await fetch('/api/push-to-shippingeasy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPushResult({ ok: false, message: data.error || 'Failed to push to ShippingEasy' })
      } else {
        setPushResult({ ok: true, message: 'Order sent to ShippingEasy — check Ready to Ship' })
        // optimistically update status to printed
        onStatusChange(order.id, 'printed')
      }
    } catch (err) {
      setPushResult({ ok: false, message: err.message })
    }
    setPushing(false)
  }

  const STATUS_CYCLE = ['pending', 'printed', 'shipped']

  function nextStatus(current) {
    const idx = STATUS_CYCLE.indexOf(current)
    return idx >= 0 && idx < STATUS_CYCLE.length - 1 ? STATUS_CYCLE[idx + 1] : null
  }

  const next = nextStatus(order.status)

  return (
    <>
      <tr
        className={`ot-row ot-row--${order.status}${expanded ? ' ot-row--expanded' : ''}`}
        onClick={() => setExpanded(e => !e)}
      >
        <td><span className="mono order-id">{order.id}</span></td>
        {!compact && <td><span className="client-name">{clientName}</span></td>}
        <td><span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{order.customer_name ?? '—'}</span></td>
        <td>
          <span className="mono sku-id">{order.sku}</span>
          <span className="sku-name">{order.sku_name}</span>
        </td>
        <td className="align-right"><span className="mono qty">{order.quantity}</span></td>
        <td><span className="destination">{order.destination}</span></td>
        <td className="align-right"><span className="mono shipping-cost">{fmtUSD(order.shipping_cost)}</span></td>
        <td className="align-right"><span className="mono fee">{fmtUSD(order.fulfillment_fee)}</span></td>
        <td><StatusBadge status={order.status} /></td>
        <td><span className="mono age">{fmtDate(order.created_at)}</span></td>
        <td><span className="mono age">{fmtRelative(order.created_at)}</span></td>
      </tr>

      {expanded && (
        <tr className="ot-detail-row">
          <td colSpan={compact ? 10 : 11}>
            <div className="ot-detail">
              <div className="detail-item">
                <span className="detail-label">Wix Order</span>
                <span className="detail-val mono">{order.wix_order_id ?? '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Customer</span>
                <span className="detail-val">
                  {order.customer_name ?? '—'}
                  {order.customer_email && (
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {order.customer_email}
                    </span>
                  )}
                  {order.customer_phone && (
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>
                      {order.customer_phone}
                    </span>
                  )}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tracking</span>
                <span className="detail-val mono">
                  {order.tracking_number ?? '—'}
                  {order.carrier && <span className="carrier-tag">{order.carrier}</span>}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Shipping Option</span>
                <span className="detail-val">{order.shipping_method ?? '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Billed</span>
                <span className="detail-val mono accent">
                  {fmtUSD(Number(order.shipping_cost) + Number(order.fulfillment_fee))}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Full Destination</span>
                <span className="detail-val">{order.destination}</span>
              </div>
              {/* Action buttons */}
              <div className="detail-item" style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {pushResult && (
                  <span style={{ fontSize: 10, color: pushResult.ok ? 'var(--accent)' : 'var(--error)' }}>
                    {pushResult.message}
                  </span>
                )}
                {order.status === 'pending' && (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 10, padding: '4px 10px' }}
                    onClick={handlePushToSE}
                    disabled={pushing}
                  >
                    {pushing ? '⟳ Sending...' : '📦 Create Label'}
                  </button>
                )}
                {next && (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 10, padding: '4px 10px' }}
                    onClick={e => { e.stopPropagation(); onStatusChange(order.id, next) }}
                  >
                    Mark {next.charAt(0).toUpperCase() + next.slice(1)}
                  </button>
                )}
                {order.status !== 'pending' && (
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 10, padding: '4px 10px' }}
                    onClick={e => { e.stopPropagation(); onStatusChange(order.id, 'pending') }}
                  >
                    Revert to Pending
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
