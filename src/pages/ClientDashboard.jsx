import { useAuth } from '../context/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import StatCard from '../components/StatCard.jsx'
import StorageCard from '../components/StorageCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { CLIENTS, ORDERS, fmtUSD, fmtRelative, storageDaysRemaining } from '../data/mockData.js'
import './ClientDashboard.css'

export default function ClientDashboard() {
  const { profile, signOut } = useAuth()

  // Get this client's data from mock data (will be real Supabase data in Session 3)
  const client = CLIENTS.find(c => c.id === profile?.client_id) ?? CLIENTS[0]
  const orders = ORDERS.filter(o => o.clientId === client.id)

  const pending = orders.filter(o => o.status === 'pending').length
  const shipped = orders.filter(o => o.status === 'shipped').length
  const totalBilled = orders.reduce((s, o) => s + o.shippingCost + o.fulfillmentFee, 0)
  const daysLeft = storageDaysRemaining(client)

  return (
    <>
      <TopBar
        title={client.name}
        subtitle="Client Portal"
        actions={
          <button className="btn btn-ghost" onClick={signOut} style={{ fontSize: 11 }}>
            Sign out
          </button>
        }
      />

      <div className="page-content">
        {/* Welcome */}
        <div className="cd-welcome">
          <span className="cd-welcome-text">
            Welcome back, <span className="cd-welcome-name">{client.contact}</span>
          </span>
          <span className="cd-welcome-sub">
            Here's your fulfillment summary for the current billing cycle.
          </span>
        </div>

        {/* KPIs */}
        <div className="cd-stat-grid">
          <StatCard label="Orders This Cycle" value={orders.length} sub={`${pending} pending · ${shipped} shipped`} />
          <StatCard label="Total Billed" value={fmtUSD(totalBilled)} sub="Shipping + $3.00 fulfillment fee" accent />
          <StatCard label="Free Storage" value={`${Math.max(0, daysLeft)}d`} sub={daysLeft > 0 ? 'remaining' : 'Storage billing active'} />
          <StatCard label="Fulfillment Fee" value="$3.00" sub="Per order, flat rate" />
        </div>

        {/* Storage */}
        <div className="cd-section-label">
          <span className="section-label">Storage Status</span>
        </div>
        <StorageCard client={client} />

        {/* Orders */}
        <div className="cd-section-label" style={{ marginTop: 24 }}>
          <span className="section-label">Your Orders</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {orders.length} total this cycle
          </span>
        </div>

        <div className="cd-orders card">
          <table className="cd-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>SKU</th>
                <th className="align-right">Qty</th>
                <th>Destination</th>
                <th className="align-right">Shipping</th>
                <th className="align-right">Fee</th>
                <th className="align-right">Total</th>
                <th>Status</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="cd-row">
                  <td><span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{o.id}</span></td>
                  <td>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>{o.sku}</span>
                    <span style={{ fontSize: 12 }}>{o.skuName}</span>
                  </td>
                  <td className="align-right"><span className="mono" style={{ fontWeight: 600 }}>{o.quantity}</span></td>
                  <td><span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{o.destination}</span></td>
                  <td className="align-right"><span className="mono" style={{ fontSize: 12 }}>{fmtUSD(o.shippingCost)}</span></td>
                  <td className="align-right"><span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtUSD(o.fulfillmentFee)}</span></td>
                  <td className="align-right">
                    <span className="mono" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                      {fmtUSD(o.shippingCost + o.fulfillmentFee)}
                    </span>
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtRelative(o.createdAt)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Billing info */}
        <div className="cd-billing card">
          <span className="section-label">Billing Info</span>
          <div className="cd-billing-row">
            <div className="cd-billing-item">
              <span className="cd-billing-label">Billing Cycle</span>
              <span className="cd-billing-val">{client.billingCycleDays} days</span>
            </div>
            <div className="cd-billing-item">
              <span className="cd-billing-label">Payment Method</span>
              <span className="cd-billing-val">{client.paymentMethod}</span>
            </div>
            <div className="cd-billing-item">
              <span className="cd-billing-label">Storage Rate</span>
              <span className="cd-billing-val mono">${client.storageCostPerPallet}/pallet/mo</span>
            </div>
            <div className="cd-billing-item">
              <span className="cd-billing-label">Questions?</span>
              <span className="cd-billing-val" style={{ color: 'var(--accent)' }}>nick@rover-fulfillment.com</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
