// api/poll-wix.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    // Fetch orders from Wix
    const wixRes = await fetch(
      'https://www.wixapis.com/ecom/v1/orders/search',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.WIX_API_KEY,
          'wix-site-id': process.env.WIX_SITE_ID,
        },
        body: JSON.stringify({
          query: {
            filter: JSON.stringify({ status: 'APPROVED' }),
            sort: [{ fieldName: 'dateCreated', order: 'DESC' }],
            paging: { limit: 50 }
          }
        })
      }
    )

    if (!wixRes.ok) {
      const err = await wixRes.text()
      return res.status(500).json({ error: 'Wix API error', detail: err })
    }

    const wixData = await wixRes.json()
    const orders = wixData.orders || []

    if (orders.length === 0) {
      return res.status(200).json({ message: 'No orders found', inserted: 0 })
    }

    // Get existing wix_order_ids to avoid duplicates
    const wixIds = orders.map(o => o.id)
    const { data: existing } = await supabase
      .from('orders')
      .select('wix_order_id')
      .in('wix_order_id', wixIds)

    const existingIds = new Set((existing || []).map(e => e.wix_order_id))

    // Build new orders to insert
    const toInsert = []
    for (const order of orders) {
      if (existingIds.has(order.id)) continue

      const lineItems = order.lineItems || []
      
      for (const item of lineItems) {
        const address = order.shippingInfo?.shipmentDetails?.address || {}
        const destination = [
          address.addressLine,
          address.city,
          address.subdivision,
          address.postalCode,
          address.country
        ].filter(Boolean).join(', ')

        toInsert.push({
          id: crypto.randomUUID(),
          client_id: 'hhzero',
          wix_order_id: order.id,
          sku: item.catalogReference?.catalogItemId || 'unknown',
          sku_name: item.productName?.original || item.productName || 'Unknown SKU',
          quantity: item.quantity || 1,
          destination: destination || 'No address provided',
          status: 'pending',
          shipping_cost: 0,
          fulfillment_fee: 0.50,
          created_at: order.dateCreated || new Date().toISOString()
        })
      }
    }

    if (toInsert.length === 0) {
      return res.status(200).json({ message: 'All orders already exist', inserted: 0 })
    }

    const { error: insertError } = await supabase
      .from('orders')
      .insert(toInsert)

    if (insertError) {
      return res.status(500).json({ error: 'Supabase insert error', detail: insertError })
    }

    return res.status(200).json({ 
      message: `Successfully inserted ${toInsert.length} orders`,
      inserted: toInsert.length
    })

  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error', detail: err.message })
  }
}