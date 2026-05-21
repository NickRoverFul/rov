import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar.jsx'
import StatCard from '../components/StatCard.jsx'
import OrderTable from '../components/OrderTable.jsx'
import StorageCard from '../components/StorageCard.jsx'
import { supabase } from '../lib/supabase.js'
import { fmtUSD } from '../lib/utils.js'
import './Dashboard.css'

export default function Dashboard() {
  const [orders, setOrders]   = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: ordersData }, { data: clientsData }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*, skus(*)'),
      ])
      setOrders(ordersData ?? [])
      setClients(clientsData ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const today        = new Date().toDateString()
  const ordersToday  = orders.filter(o => new Date(o.created_at).toDateString() === today)
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const totalRevenue = orders.reduce((s, o) => s + Number(o.shipping_cost ?? 0) + Number(o.fulfillment_fee ?? 0), 0)

  return (
    <>
      <TopBar title="Dashboard" subtitle="Rover Fulfillment WMS" />

      <div className="page-content">
        {/* KPI Row */}
        <div className="stat-grid">
          <StatCard
            label="Active Clients"
            value={clients.length}
            sub="HH Zero onboarded Apr 20"
          />
          <StatCard
            label="Orders Today"
            value={ordersToday.length}
            sub={`${pendingCount} pending action`}
          />
          <StatCard
            label="Pending Labels"
            value={pendingCount}
            sub="Awaiting shipment"
          />
          <StatCard
            label="Cycle Revenue"
            value={fmtUSD(totalRevenue)}
            sub="Shipping + fulfillment fees"
            accent={true}
          />
        </div>

        {/* Main two-column */}
        <div className="dashboard-body">
          {/* Order Feed */}
          <div className="dashboard-orders">
            <div className="section-header">
              <span className="section-label">Recent Orders</span>
              <a href="/orders" className="section-link">View all →</a>
            </div>
            {loading ? (
              <div className="loading-placeholder">Loading...</div>
            ) : (
              <OrderTable orders={orders} clients={clients} limit={6} />
            )}
          </div>

          {/* Right panel */}
          <div className="dashboard-right">
            <div className="section-header">
              <span className="section-label">Storage Status</span>
            </div>
            {clients.map(c => (
              <StorageCard key={c.id} client={c} />
            ))}

            {/* Next billing */}
            <div className="billing-card card">
              <div className="billing-header">
                <span className="section-label">Next Invoice</span>
                <span className="billing-countdown mono">
                  {billingDaysLeft(clients)} days
                </span>
              </div>
              <div className="billing-rows">
                {clients.map(c => (
                  <div key={c.id} className="billing-row">
                    <span className="billing-client">{c.name}</span>
                    <div className="billing-detail">
                      <span className="billing-cycle">{c.billing_cycle_days}-day cycle</span>
                      <span className="billing-method">{c.payment_method}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function billingDaysLeft(clients) {
  const client = clients[0]
  if (!client) return '—'
  const cycleStart  = new Date(client.storage_start ?? '2026-04-20')
  const today       = new Date()
  const daysSince   = Math.floor((today - cycleStart) / (1000 * 60 * 60 * 24))
  const daysInCycle = client.billing_cycle_days ?? 15
  return daysInCycle - (daysSince % daysInCycle)
}
