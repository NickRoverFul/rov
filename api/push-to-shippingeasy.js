// api/push-to-shippingeasy.js
// Pushes a single ROV order to ShippingEasy so it appears in "Ready to Ship"
// Auth: HMAC-SHA256 using SHIPPINGEASY_API_KEY + SHIPPINGEASY_API_SECRET
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SE_BASE = 'https://app.shippingeasy.com'
const API_KEY = process.env.SHIPPINGEASY_API_KEY
const API_SECRET = process.env.SHIPPINGEASY_API_SECRET

/**
 * ShippingEasy requires HMAC-SHA256 auth on every request.
 * Signature = HMAC-SHA256(secret, "METHOD&encoded_path&encoded_params")
 */
function buildAuthHeaders(method, path, body = '') {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const contentMd5 = body
    ? crypto.createHash('md5').update(body).digest('base64')
    : ''

  const stringToSign = [
    method.toUpperCase(),
    contentMd5,
    'application/json',
    timestamp,
    path,
  ].join('\n')

  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(stringToSign)
    .digest('base64')

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Date': new Date().toUTCString(),
    'Timestamp': timestamp,
    'Content-MD5': contentMd5,
    'Authorization': `APIAuth ${API_KEY}:${signature}`,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { orderId } = req.body || {}
  if (!orderId) {
    return res.status(400).json({ error: 'orderId required' })
  }

  // Fetch order from Supabase
  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (fetchErr || !order) {
    return res.status(404).json({ error: 'Order not found', detail: fetchErr?.message })
  }

  // Parse destination back into address parts (best effort)
  // destination is stored as "addressLine, city, state, zip, country"
  const parts = (order.destination || '').split(',').map(s => s.trim())
  const address1   = parts[0] || ''
  const city       = parts[1] || ''
  const statePart  = parts[2] || ''
  const postalCode = parts[3] || ''
  const country    = parts[4] || 'US'

  // Build ShippingEasy order payload
  const seOrder = {
    order: {
      external_order_identifier: order.wix_order_id || order.id,
      ordered_at: order.created_at,
      order_status: 'awaiting_shipment',
      from_store_id: process.env.SHIPPINGEASY_STORE_ID, // numeric store ID from SE
      billing_company: 'HH Zero',
      shipping_address: {
        name:        order.customer_name || 'Customer',
        company:     '',
        address:     address1,
        city:        city,
        state:       statePart,
        country:     country || 'US',
        postal_code: postalCode,
        email:       order.customer_email || '',
        phone:       order.customer_phone || '',
      },
      line_items: [
        {
          item_name:    order.sku_name || 'HH Zero Product',
          sku:          order.sku || '',
          quantity:     order.quantity || 1,
          unit_price:   '0.00',
          total_price:  '0.00',
        }
      ],
    }
  }

  const body = JSON.stringify(seOrder)
  const path = '/api/orders'
  const headers = buildAuthHeaders('POST', path, body)

  try {
    const seRes = await fetch(`${SE_BASE}${path}`, {
      method: 'POST',
      headers,
      body,
    })

    const seData = await seRes.json()

    if (!seRes.ok) {
      return res.status(500).json({
        error: 'ShippingEasy API error',
        status: seRes.status,
        detail: seData,
      })
    }

    // Mark order as 'printed' in Supabase once pushed to SE
    await supabase
      .from('orders')
      .update({ status: 'printed' })
      .eq('id', orderId)

    return res.status(200).json({
      message: 'Order pushed to ShippingEasy',
      se_order_id: seData.order?.id,
    })
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error', detail: err.message })
  }
}
