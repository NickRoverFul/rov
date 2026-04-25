import { useState } from 'react'
import StatusBadge from './StatusBadge.jsx'
import { CLIENTS, fmtRelative, fmtUSD } from '../data/mockData.js'
import './OrderTable.css'

const FILTER_OPTIONS = [
  { value: 'all',     label: 'All Clients' },
  { value: 'hhzero',  label: 'HH Zero' },
]

const STATUS_FILTERS = [
  { value: 'all',     label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'printed', label: 'Printed' },
  { value: 'shipped', label: 'Shipped' },
]

export default function OrderTable({ orders, limit, compact = false }) {
  const [clientFilter, setClientFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const getClientName = (clientId) => {
    const c = CLIENTS.find(c => c.id === clientId)
    return c ? c.name : clientId
  }

  const filtered = orders
    .filter(o => clientFilter === 'all' || o.clientId === clientFilter)
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
          {FILTER_OPTIONS.map(f => (
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

        {/* Live counts */}
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
              <th>SKU</th>
              <th className="align-right">Qty</th>
              <th>Destination</th>
              <th className="align-right">Shipping</th>
              <th className="align-right">Fee</th>
              <th>Status</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={compact ? 7 : 8} className="ot-empty">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              filtered.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  clientName={getClientName(order.clientId)}
                  compact={compact}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OrderRow({ order, clientName, compact }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className={`ot-row ot-row--${order.status}${expanded ? ' ot-row--expanded' : ''}`}
        onClick={() => setExpanded(e => !e)}
      >
        <td>
          <span className="mono order-id">{order.id}</span>
        </td>
        {!compact && (
          <td>
            <span className="client-name">{clientName}</span>
          </td>
        )}
        <td>
          <span className="mono sku-id">{order.sku}</span>
          <span className="sku-name">{order.skuName}</span>
        </td>
        <td className="align-right">
          <span className="mono qty">{order.quantity}</span>
        </td>
        <td>
          <span className="destination">{order.destination}</span>
        </td>
        <td className="align-right">
          <span className="mono shipping-cost">{fmtUSD(order.shippingCost)}</span>
        </td>
        <td className="align-right">
          <span className="mono fee">{fmtUSD(order.fulfillmentFee)}</span>
        </td>
        <td>
          <StatusBadge status={order.status} />
        </td>
        <td>
          <span className="mono age">{fmtRelative(order.createdAt)}</span>
        </td>
      </tr>

      {expanded && (
        <tr className="ot-detail-row">
          <td colSpan={compact ? 8 : 9}>
            <div className="ot-detail">
              <div className="detail-item">
                <span className="detail-label">Wix Order</span>
                <span className="detail-val mono">{order.wixOrderId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tracking</span>
                <span className="detail-val mono">
                  {order.trackingNumber ?? '—'}
                  {order.carrier && <span className="carrier-tag">{order.carrier}</span>}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Billed</span>
                <span className="detail-val mono accent">
                  {fmtUSD(order.shippingCost + order.fulfillmentFee)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Full Destination</span>
                <span className="detail-val">{order.destination}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
