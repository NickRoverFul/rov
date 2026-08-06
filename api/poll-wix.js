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

    // Get existing wix_order_ids to check for duplicates / missing data
    const wixIds = orders.map(o => o.id)
    const { data: existing } = await supabase
      .from('orders')
      .select('wix_order_id, destination, customer_name, shipping_method')
      .in('wix_order_id', wixIds)

    const existingMap = {}
    for (const e of (existing || [])) {
      existingMap[e.wix_order_id] = e
    }

    // Build new orders to insert, and updates for orders missing address data
    const toInsert = []
    const toUpdate = [] // orders already in DB but with missing customer/destination

    for (const order of orders) {
      const lineItems = order.lineItems || []

      // ── Address: Wix ecom v1 path ─────────────────────────────────────────
      // shippingInfo.logistics.shippingDestination.address
      const dest = order.shippingInfo?.logistics?.shippingDestination || {}
      const address = dest.address || {}
      const contactDetails = dest.contactDetails || {}

      const destination = [
        address.addressLine,
        address.addressLine2,
        address.city,
        address.subdivision,
        address.postalCode,
        address.country
      ].filter(Boolean).join(', ')

      // Recipient name: try shipping destination contact, then buyer info
      const recipientName =
        (contactDetails.firstName || contactDetails.lastName)
          ? [contactDetails.firstName, contactDetails.lastName].filter(Boolean).join(' ')
          : (order.buyerInfo?.contactDetails?.fullName || null)

      const customerEmail = contactDetails.email || order.buyerInfo?.email || null
      const customerPhone = contactDetails.phone || null

      // Selected shipping option chosen at checkout (e.g. "USPS Priority Mail")
      const shippingInfoBlock = order.shippingInfo || {}
      const shippingMethod =
        shippingInfoBlock.title ||
        shippingInfoBlock.logistics?.deliveryTime?.title ||
        shippingInfoBlock.carrierId ||
        null

      const existing = existingMap[order.id]

      if (existing) {
        // Order already in DB — update if it's missing address/name/shipping data
        const needsUpdate =
          (!existing.destination || existing.destination === 'No address provided') ||
          !existing.customer_name ||
          !existing.shipping_method

        if (needsUpdate && (destination || shippingMethod)) {
          toUpdate.push({
            wix_order_id: order.id,
            destination: destination || 'No address provided',
            customer_name: recipientName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            shipping_method: shippingMethod || existing.shipping_method || null,
          })
        }
        continue
      }

      // New order — insert a row per line item
      for (const item of lineItems) {
        toInsert.push({
          id: crypto.randomUUID(),
          client_id: 'hhzero',
          wix_order_id: order.id,
          sku: item.catalogReference?.catalogItemId || 'unknown',
          sku_name: item.productName?.original || item.productName || 'Unknown SKU',
          quantity: item.quantity || 1,
          destination: destination || 'No address provided',
          customer_name: recipientName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          status: 'pending',
          shipping_cost: 0,
          fulfillment_fee: 3.00,
          shipping_method: shippingMethod,
          created_at: order.dateCreated || new Date().toISOString()
        })
      }
    }

    // Perform updates for existing orders with missing data
    let updated = 0
    for (const u of toUpdate) {
      await supabase
        .from('orders')
        .update({
          destination: u.destination,
          customer_name: u.customer_name,
          customer_email: u.customer_email,
          customer_phone: u.customer_phone,
          shipping_method: u.shipping_method,
        })
        .eq('wix_order_id', u.wix_order_id)
      updated++
    }

    if (toInsert.length === 0 && updated === 0) {
      return res.status(200).json({ message: 'All orders already exist', inserted: 0, updated: 0 })
    }

    let inserted = 0
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('orders')
        .insert(toInsert)

      if (insertError) {
        return res.status(500).json({ error: 'Supabase insert error', detail: insertError })
      }
      inserted = toInsert.length
    }

    return res.status(200).json({
      message: `Inserted ${inserted} new order(s), updated ${updated} existing order(s)`,
      inserted,
      updated
    })

  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error', detail: err.message })
  }
}
