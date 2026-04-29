import TopBar from '../components/TopBar.jsx'
import StorageCard from '../components/StorageCard.jsx'
import { CLIENTS, ORDERS, palletsUsed, totalCases, fmtUSD } from '../data/mockData.js'
import './Clients.css'

export default function Clients() {
  return (
    <>
      <TopBar
        title="Clients"
        subtitle={`${CLIENTS.length} active client`}
      />

      <div className="page-content">
        {CLIENTS.map(client => (
          <ClientProfile key={client.id} client={client} />
        ))}

        {/* Placeholder for future clients */}
        <div className="add-client-card">
          <span className="add-client-icon">+</span>
          <div className="add-client-text">
            <span className="add-client-label">Add new client</span>
            <span className="add-client-sub">Shopify and additional store types coming in Session 2+</span>
          </div>
        </div>
      </div>
    </>
  )
}

function ClientProfile({ client }) {
  const clientOrders = ORDERS.filter(o => o.clientId === client.id)
  const totalRevenue = clientOrders.reduce(
    (s, o) => s + o.shippingCost + o.fulfillmentFee, 0
  )

  return (
    <div className="client-profile">
      {/* Header */}
      <div className="cp-header card">
        <div className="cp-header-left">
          <div className="cp-avatar">
            {client.shortName}
          </div>
          <div className="cp-info">
            <h2 className="cp-name">{client.name}</h2>
            <div className="cp-meta">
              <span className="cp-meta-item">
                <span className="meta-label">Contact</span>
                <span className="meta-val">{client.contact}</span>
              </span>
              <span className="meta-sep" />
              <span className="cp-meta-item">
                <span className="meta-label">Email</span>
                <span className="meta-val mono">{client.email}</span>
              </span>
              <span className="meta-sep" />
              <span className="cp-meta-item">
                <span className="meta-label">Payment</span>
                <span className="meta-val">{client.paymentMethod}</span>
              </span>
              <span className="meta-sep" />
              <span className="cp-meta-item">
                <span className="meta-label">Billing Cycle</span>
                <span className="meta-val">{client.billingCycleDays} days</span>
              </span>
            </div>
          </div>
        </div>
        <div className="cp-header-stats">
          <div className="cp-stat">
            <span className="mono cp-stat-val">{fmtUSD(client.fulfillmentFee)}</span>
            <span className="cp-stat-label">per order</span>
          </div>
          <div className="cp-stat">
            <span className="mono cp-stat-val">{clientOrders.length}</span>
            <span className="cp-stat-label">total orders</span>
          </div>
          <div className="cp-stat cp-stat--accent">
            <span className="mono cp-stat-val">{fmtUSD(totalRevenue)}</span>
            <span className="cp-stat-label">cycle revenue</span>
          </div>
          <div className="cp-status">
            <span className="cp-status-dot" />
            <span className="cp-status-label">Active</span>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="cp-body">
        {/* Left: SKU table + orders */}
        <div className="cp-left">
          {/* SKU Inventory */}
          <div className="card">
            <div className="cp-section-header">
              <span className="section-label">Inventory — SKUs</span>
              <div className="cp-section-meta">
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                  {totalCases(client)} cases total
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--font-ui)' }}>·</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                  {palletsUsed(client)} pallets
                </span>
              </div>
            </div>

            <table className="sku-table">
              <thead>
                <tr>
                  <th>SKU ID</th>
                  <th>Name</th>
                  <th className="align-right">Units / Case</th>
                  <th className="align-right">Cases on Hand</th>
                  <th className="align-right">Pallet Share</th>
                  <th className="align-right">Est. Weight</th>
                </tr>
              </thead>
              <tbody>
                {client.skus.map(sku => {
                  const palletShare = sku.casesOnHand / client.casesPerPallet
                  const weight = sku.casesOnHand * client.weightPerCase
                  return (
                    <tr key={sku.id} className="sku-row">
                      <td><span className="mono sku-id-cell">{sku.id}</span></td>
                      <td><span className="sku-name-cell">{sku.name}</span></td>
                      <td className="align-right">
                        <span className="mono">{sku.unitsPerCase}</span>
                      </td>
                      <td className="align-right">
                        <span className="mono cases-count">{sku.casesOnHand}</span>
                      </td>
                      <td className="align-right">
                        <div className="pallet-share-cell">
                          <span className="mono pallet-frac">
                            {palletShare.toFixed(2)}
                          </span>
                          <div className="mini-bar">
                            <div
                              className="mini-bar-fill"
                              style={{ width: `${Math.min((palletShare / palletsUsed(client)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="align-right">
                        <span className="mono weight-cell">{weight.toLocaleString()} lbs</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="sku-total-row">
                  <td colSpan={3}><span className="section-label">Totals</span></td>
                  <td className="align-right">
                    <span className="mono total-val">{totalCases(client)}</span>
                  </td>
                  <td className="align-right">
                    <span className="mono total-val">{palletsUsed(client)} pallets</span>
                  </td>
                  <td className="align-right">
                    <span className="mono total-val">
                      {(totalCases(client) * client.weightPerCase).toLocaleString()} lbs
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Config block */}
          <div className="card cp-config">
            <span className="section-label">Pallet Configuration</span>
            <div className="config-row">
              <div className="config-item">
                <span className="config-label">Cases per pallet</span>
                <span className="config-val mono">{client.casesPerPallet}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Weight per case</span>
                <span className="config-val mono">{client.weightPerCase} lbs</span>
              </div>
              <div className="config-item">
                <span className="config-label">Pallet calc</span>
                <span className="config-val mono">⌈cases ÷ {client.casesPerPallet}⌉</span>
              </div>
              <div className="config-item">
                <span className="config-label">Storage rate</span>
                <span className="config-val mono">${client.storageCostPerPallet}/pallet/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Storage card */}
        <div className="cp-right">
          <StorageCard client={client} />

          {/* Recent orders mini */}
          <div className="card cp-recent-orders">
            <div className="cp-section-header">
              <span className="section-label">Recent Orders</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {clientOrders.length} total
              </span>
            </div>
            {clientOrders.slice(0, 5).map(o => (
              <div key={o.id} className="mini-order-row">
                <div className="mini-order-left">
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600 }}>
                    {o.id}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                    {o.skuName} × {o.quantity}
                  </span>
                </div>
                <div className="mini-order-right">
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                    {fmtUSD(o.shippingCost + o.fulfillmentFee)}
                  </span>
                  <span
                    className={`mini-status mini-status--${o.status}`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
