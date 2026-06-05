// api/shipment-callback.js
// ShippingEasy calls this URL when a label is printed for an order.
// Verifies the store API key, then updates tracking + status in Supabase.
// Configured in ShippingEasy: Account Settings → Stores → Shipment Callback URL
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify it's actually ShippingEasy calling us
  const storeApiKey = req.headers['x-shippingeasy-store-api-key']
    || req.query.api_key
    || req.body?.api_key

  if (storeApiKey && storeApiKey !== process.env.SHIPPINGEASY_STORE_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const payload = req.body || {}

  // ShippingEasy sends shipment data including the external_order_identifier
  // which is the wix_order_id (or ROV order id) we set when pushing the order
  const externalId     = payload.external_order_identifier || payload.order_number
  const trackingNumber = payload.tracking_number
  const carrier        = payload.carrier_name || payload.carrier_code
  const shippingCost   = payload.postage_amount || payload.rate

  if (!externalId) {
    return res.status(400).json({ error: 'No external_order_identifier in payload' })
  }

  // Try matching on wix_order_id first, fall back to id
  let { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('wix_order_id', externalId)
    .single()

  if (!order) {
    const { data: orderById } = await supabase
      .from('orders')
      .select('id')
      .eq('id', externalId)
      .single()
    order = orderById
  }

  if (!order) {
    // ShippingEasy should still get a 200 so it doesn't retry forever
    console.error(`shipment-callback: no order found for external id ${externalId}`)
    return res.status(200).json({ warning: 'Order not found, ignoring' })
  }

  const updates = {
    status: 'shipped',
    shipped_at: new Date().toISOString(),
    ...(trackingNumber && { tracking_number: trackingNumber }),
    ...(carrier && { carrier }),
    ...(shippingCost && { shipping_cost: parseFloat(shippingCost) }),
  }

  const { error: updateErr } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', order.id)

  if (updateErr) {
    return res.status(500).json({ error: 'Supabase update error', detail: updateErr.message })
  }

  return res.status(200).json({ message: 'Shipment recorded', order_id: order.id })
}
