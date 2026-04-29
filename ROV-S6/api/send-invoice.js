// api/send-invoice.js
// Vercel serverless function — runs on the server, keeps Resend API key secret

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { invoice, client } = req.body

  if (!invoice || !client) {
    return res.status(400).json({ error: 'Missing invoice or client data' })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY

  // Build invoice HTML email
  const orderRows = invoice.orders.map(o => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-family:monospace;font-size:12px;color:#aaa">${o.id}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-size:13px;color:#eee">${o.sku_name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-size:13px;color:#eee;text-align:center">${o.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-size:13px;color:#eee">${o.destination}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-family:monospace;font-size:13px;color:#eee;text-align:right">$${Number(o.shipping_cost).toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-family:monospace;font-size:13px;color:#aaa;text-align:right">$${Number(o.fulfillment_fee).toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #222;font-family:monospace;font-size:13px;color:#FF6200;font-weight:600;text-align:right">$${(Number(o.shipping_cost) + Number(o.fulfillment_fee)).toFixed(2)}</td>
    </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0B0B;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <div style="max-width:700px;margin:0 auto;padding:40px 20px">

    <!-- Header -->
    <div style="display:flex;align-items:center;margin-bottom:32px">
      <div style="background:#FF6200;border-radius:8px;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;margin-right:12px">
        <span style="color:#fff;font-size:22px;font-weight:700;line-height:1">R</span>
      </div>
      <div>
        <div style="color:#eee;font-size:17px;font-weight:700;letter-spacing:0.1em">ROV</div>
        <div style="color:#666;font-size:11px;letter-spacing:0.04em">Rover Fulfillment LLC</div>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div style="color:#FF6200;font-size:22px;font-weight:700;font-family:monospace">${invoice.invoice_number}</div>
        <div style="color:#666;font-size:11px;margin-top:2px">${invoice.period_label}</div>
      </div>
    </div>

    <!-- Divider -->
    <div style="height:1px;background:#222;margin-bottom:28px"></div>

    <!-- Bill to / from -->
    <div style="display:flex;justify-content:space-between;margin-bottom:28px;gap:20px">
      <div>
        <div style="color:#555;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px">Bill To</div>
        <div style="color:#eee;font-size:14px;font-weight:600">${client.name}</div>
        <div style="color:#888;font-size:12px;margin-top:2px">${client.contact}</div>
        <div style="color:#888;font-size:12px">${client.email}</div>
      </div>
      <div style="text-align:right">
        <div style="color:#555;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px">From</div>
        <div style="color:#eee;font-size:14px;font-weight:600">Rover Fulfillment LLC</div>
        <div style="color:#888;font-size:12px;margin-top:2px">nick@rover-fulfillment.com</div>
        <div style="color:#888;font-size:12px">Chantilly, Virginia</div>
      </div>
    </div>

    <!-- Summary boxes -->
    <div style="display:flex;gap:12px;margin-bottom:28px">
      <div style="flex:1;background:#111;border:1px solid #222;border-radius:6px;padding:14px 16px">
        <div style="color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Orders</div>
        <div style="color:#eee;font-size:22px;font-weight:700;font-family:monospace">${invoice.orders.length}</div>
      </div>
      <div style="flex:1;background:#111;border:1px solid #222;border-radius:6px;padding:14px 16px">
        <div style="color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Shipping</div>
        <div style="color:#eee;font-size:22px;font-weight:700;font-family:monospace">$${Number(invoice.total_shipping).toFixed(2)}</div>
      </div>
      <div style="flex:1;background:#111;border:1px solid #222;border-radius:6px;padding:14px 16px">
        <div style="color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Fulfillment</div>
        <div style="color:#eee;font-size:22px;font-weight:700;font-family:monospace">$${Number(invoice.total_fulfillment).toFixed(2)}</div>
      </div>
      <div style="flex:1;background:#FF6200;border-radius:6px;padding:14px 16px">
        <div style="color:rgba(255,255,255,0.7);font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">Total Due</div>
        <div style="color:#fff;font-size:22px;font-weight:700;font-family:monospace">$${Number(invoice.total_due).toFixed(2)}</div>
      </div>
    </div>

    <!-- Orders table -->
    <table style="width:100%;border-collapse:collapse;background:#111;border:1px solid #222;border-radius:6px;overflow:hidden;margin-bottom:28px">
      <thead>
        <tr style="background:#181818">
          <th style="padding:10px 12px;text-align:left;color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Order</th>
          <th style="padding:10px 12px;text-align:left;color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">SKU</th>
          <th style="padding:10px 12px;text-align:center;color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Qty</th>
          <th style="padding:10px 12px;text-align:left;color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Destination</th>
          <th style="padding:10px 12px;text-align:right;color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Shipping</th>
          <th style="padding:10px 12px;text-align:right;color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Fee</th>
          <th style="padding:10px 12px;text-align:right;color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderRows}
      </tbody>
    </table>

    <!-- Payment info -->
    <div style="background:#111;border:1px solid #222;border-radius:6px;padding:16px;margin-bottom:28px">
      <div style="color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:10px">Payment Instructions</div>
      <div style="color:#eee;font-size:13px;margin-bottom:4px">Please remit payment via <strong>ACH Wire Transfer</strong> or <strong>Zelle</strong>.</div>
      <div style="color:#888;font-size:12px;margin-top:8px">Payment due within <strong style="color:#eee">15 days</strong> of invoice date.</div>
      <div style="color:#888;font-size:12px;margin-top:4px">Questions? Contact <span style="color:#FF6200">nick@rover-fulfillment.com</span></div>
    </div>

    ${invoice.notes ? `
    <div style="background:#111;border:1px solid #222;border-radius:6px;padding:16px;margin-bottom:28px">
      <div style="color:#555;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px">Notes</div>
      <div style="color:#aaa;font-size:13px;line-height:1.5">${invoice.notes}</div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="height:1px;background:#222;margin-bottom:20px"></div>
    <div style="color:#444;font-size:11px;text-align:center;line-height:1.5">
      Rover Fulfillment LLC · Chantilly, Virginia · nick@rover-fulfillment.com<br>
      This invoice was generated automatically by ROV Warehouse Management System.
    </div>

  </div>
</body>
</html>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rover Fulfillment <nick@roverfulfillment.com>',
        to: [client.email],
        cc: ['nick@rover-fulfillment.com'],
        subject: `Invoice ${invoice.invoice_number} — ${client.name} — $${Number(invoice.total_due).toFixed(2)} due`,
        html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: data.message || 'Failed to send email' })
    }

    return res.status(200).json({ success: true, id: data.id })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
