import { useState, useEffect } from 'react'
import TopBar from '../components/TopBar.jsx'
import OrderTable from '../components/OrderTable.jsx'
import { supabase } from '../lib/supabase.js'
import './Orders.css'

export default function Orders() {
  const [orders, setOrders]     = useState([])
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [syncResult, setSyncResult] = useState(null) // { inserted, message }
  const [syncing, setSyncing]   = useState(false)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [{ data: ordersData, error: oErr }, { data: clientsData, error: cErr }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*'),
      ])
      if (oErr) throw oErr
      if (cErr) throw cErr
      setOrders(ordersData ?? [])
      setClients(clientsData ?? [])
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  async function handleSyncWix() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res  = await fetch('/api/poll-wix', { method: 'GET' })
      const data = await res.json()
      const inserted = data.inserted ?? 0
      setSyncResult({
        ok: true,
        message: inserted > 0
          ? `${inserted} new order${inserted !== 1 ? 's' : ''} pulled from Wix`
          : 'All orders already up to date',
      })
      if (inserted > 0) await fetchData()
    } catch (err) {
      setSyncResult({ ok: false, message: err.message })
    }
    setSyncing(false)
  }

  useEffect(() => { fetchData() }, [])

  return (
    <>
      <TopBar
        title="Orders"
        subtitle={loading ? 'Loading...' : `${orders.length} total`}
        actions={
          <div className="orders-actions">
            <button
              className="btn btn-ghost"
              onClick={handleSyncWix}
              disabled={syncing}
              title="Pull new orders from Wix"
            >
              {syncing ? '⟳ Syncing...' : '↻ Sync Wix'}
            </button>
          </div>
        }
      />

      {/* Sync result toast */}
      {syncResult && (
        <div
          className={`sync-toast ${syncResult.ok ? 'sync-toast--ok' : 'sync-toast--err'}`}
          onClick={() => setSyncResult(null)}
        >
          {syncResult.message} <span style={{ opacity: 0.5, marginLeft: 8 }}>✕</span>
        </div>
      )}

      <div className="page-content">
        {error && <div className="error-bar">⚠ {error}</div>}

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

        {loading ? (
          <div className="loading-placeholder">Loading orders...</div>
        ) : (
          <OrderTable orders={orders} clients={clients} />
        )}
      </div>
    </>
  )
}
