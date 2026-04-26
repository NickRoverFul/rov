import TopBar from '../components/TopBar.jsx'
import StatCard from '../components/StatCard.jsx'
import OrderTable from '../components/OrderTable.jsx'
import StorageCard from '../components/StorageCard.jsx'
import { ORDERS, CLIENTS, fmtUSD } from '../data/mockData.js'
import './Dashboard.css'

export default function Dashboard() {
  const today = new Date().toDateString()
  const ordersToday = ORDERS.filter(
    o => new Date(o.createdAt).toDateString() === today
  )
  const pendingCount = ORDERS.filter(o => o.status === 'pending').length
  const totalRevenue = ORDERS.reduce(
    (s, o) => s + o.shippingCost + o.fulfillmentFee, 0
  )

  return (
    <>
      <TopBar title="Dashboard" subtitle="Rover Fulfillment WMS" />

      <div className="page-content">
        {/* KPI Row */}
        <div className="stat-grid">
          <StatCard
            label="Active Clients"
            value={CLIENTS.length}
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
            sub="Awaiting EasyPost — Session 3"
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
            <OrderTable orders={ORDERS} limit={6} />
          </div>

          {/* Right panel */}
          <div className="dashboard-right">
            <div className="section-header">
              <span className="section-label">Storage Status</span>
            </div>
            {CLIENTS.map(c => (
              <StorageCard key={c.id} client={c} />
            ))}

            {/* Next billing */}
            <div className="billing-card card">
              <div className="billing-header">
                <span className="section-label">Next Invoice</span>
                <span className="billing-countdown mono">
                  {billingDaysLeft()} days
                </span>
              </div>
              <div className="billing-rows">
                {CLIENTS.map(c => (
                  <div key={c.id} className="billing-row">
                    <span className="billing-client">{c.name}</span>
                    <div className="billing-detail">
                      <span className="billing-cycle">{c.billingCycleDays}-day cycle</span>
                      <span className="billing-method">{c.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="billing-note">
                Auto-invoice generation via Resend in Session 4
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function billingDaysLeft() {
  // HH Zero billing cycle start = April 20, 15-day cycles
  const cycleStart = new Date('2026-04-20')
  const today = new Date()
  const daysSinceStart = Math.floor((today - cycleStart) / (1000 * 60 * 60 * 24))
  const daysInCycle = 15
  return daysInCycle - (daysSinceStart % daysInCycle)
}
