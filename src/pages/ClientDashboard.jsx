import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import StatCard from '../components/StatCard.jsx'
import StorageCard from '../components/StorageCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { supabase } from '../lib/supabase.js'
import { fmtUSD, fmtRelative, storageDaysRemaining } from '../lib/utils.js'
import './ClientDashboard.css'

export default function ClientDashboard() {
  const { profile, signOut } = useAuth()
  const [client, setClient]  = useState(null)
  const [orders, setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.client_id) return
    async function fetchData() {
      const [{ data: clientData }, { data: ordersData }] = await Promise.all([
        supabase.from('clients').select('*, skus(*)').eq('id', profile.client_id).single(),
        supabase.from('orders').select('*').eq('client_id', profile.client_id).order('created_at', { ascending: false }),
      ])
      setClient(clientData)
      setOrders(ordersData ?? [])
      setLoading(false)
    }
    fetchData()
  }, [profile])

  if (loading || !client) return <div className="loading-placeholder">Loading...</div>

  const pending    = orders.filter(o => o.status === 'pending').length
  const shipped    = orders.filter(o => o.status === 'shipped').length
  const totalBilled = orders.reduce((s, o) => s + Number(o.shipping_cost ?? 0) + Number(o.fulfillment_fee ?? 0), 0)
  const daysLeft   = storageDaysRemaining(client)

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
        <div className="cd-welcome">
          <span className="cd-welcome-text">
            Welcome back, <span className="cd-welcome-name">{client.contact}</span>
          </span>
          <span className="cd-welcome-sub">
            Here's your fulfillment summary for the current billing cycle.
          </span>
        </div>

        <div className="cd-stat-grid">
          <StatCard label="Orders This Cycle" value={orders.length} sub={`${pending} pending · ${shipped} shipped`} />
          <StatCard label="Total Billed" value={fmtUSD(totalBilled)} sub={`Shipping + $${client.fulfillment_fee} fulfillment fee`} accent />
          <StatCard label="Free Storage" value={`${Math.max(0, daysLeft)}d`} sub={daysLeft > 0 ? 'remaining' : 'Storage billing active'} />
          <StatCard label="Fulfillment Fee" value={fmtUSD(client.fulfillment_fee)} sub="Per order, flat rate" />
        </div>

        <div className="cd-section-label">
          <span className="section-label">Storage Status</span>
        </div>
        <StorageCard client={client} />

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
                <th>Order</th><th>SKU</th>
                <th className="align-right">Qty</th>
                <th>Destination</th>
                <th className="align-right">Shipping</th>
                <th className="align-right">Fee</th>
                <th className="align-right">Total</th>
                <th>Status</th><th>Age</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="cd-row">
                  <td><span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{o.id}</span></td>
                  <td>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>{o.sku}</span>
                    <span style={{ fontSize: 12 }}>{o.sku_name}</span>
                  </td>
                  <td className="align-right"><span className="mono" style={{ fontWeight: 600 }}>{o.quantity}</span></td>
                  <td><span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{o.destination}</span></td>
                  <td className="align-right"><span className="mono" style={{ fontSize: 12 }}>{fmtUSD(o.shipping_cost)}</span></td>
                  <td className="align-right"><span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtUSD(o.fulfillment_fee)}</span></td>
                  <td className="align-right">
                    <span className="mono" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                      {fmtUSD(Number(o.shipping_cost) + Number(o.fulfillment_fee))}
                    </span>
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtRelative(o.created_at)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cd-billing card">
          <span className="section-label">Billing Info</span>
          <div className="cd-billing-row">
            <div className="cd-billing-item">
              <span className="cd-billing-label">Billing Cycle</span>
              <span className="cd-billing-val">{client.billing_cycle_days} days</span>
            </div>
            <div className="cd-billing-item">
              <span className="cd-billing-label">Payment Method</span>
              <span className="cd-billing-val">{client.payment_method}</span>
            </div>
            <div className="cd-billing-item">
              <span className="cd-billing-label">Storage Rate</span>
              <span className="cd-billing-val mono">${client.storage_cost_per_pallet}/pallet/mo</span>
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
