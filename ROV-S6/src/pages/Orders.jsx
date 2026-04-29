import TopBar from '../components/TopBar.jsx'
import OrderTable from '../components/OrderTable.jsx'
import { ORDERS } from '../data/mockData.js'
import './Orders.css'

export default function Orders() {
  return (
    <>
      <TopBar
        title="Orders"
        subtitle={`${ORDERS.length} total · polling every 5 min (Session 2)`}
        actions={
          <div className="orders-actions">
            <button className="btn btn-ghost" disabled title="Wix polling — Session 2">
              ↻ Sync Wix
            </button>
            <button className="btn btn-ghost" disabled title="EasyPost — Session 3">
              ⬇ Buy Labels
            </button>
          </div>
        }
      />

      <div className="page-content">
        <div className="orders-info-bar">
          <span className="info-item">
            <span className="info-dot info-dot--pending" />
            Pending — awaiting label purchase
          </span>
          <span className="info-sep">·</span>
          <span className="info-item">
            <span className="info-dot info-dot--printed" />
            Printed — label ready for pickup
          </span>
          <span className="info-sep">·</span>
          <span className="info-item">
            <span className="info-dot info-dot--shipped" />
            Shipped — scanned by carrier
          </span>
          <span className="info-sep">·</span>
          <span className="info-item info-item--note">
            Click any row to expand order details
          </span>
        </div>

        <OrderTable orders={ORDERS} />
      </div>
    </>
  )
}
