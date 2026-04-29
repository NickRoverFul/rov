// ─────────────────────────────────────────────────────────────────────────────
//  ROV Mock Data — Session 1 (replaced by live APIs in Sessions 2–4)
// ─────────────────────────────────────────────────────────────────────────────

export const CLIENTS = [
  {
    id: 'hhzero',
    name: 'HH Zero',
    shortName: 'HHZ',
    contact: 'Denisa',
    email: 'denisa@hhzero.com',
    color: '#38C96A',

    // Billing
    fulfillmentFee: 3.00,
    billingCycleDays: 15,
    paymentMethod: 'Zelle / ACH',
    currentBalance: 0.00,

    // Storage
    storageStart: '2026-04-20',
    storageFreeEnd: '2026-06-19',
    storageBillingStart: '2026-06-20',
    storageCostPerPallet: 20.00,
    casesPerPallet: 70,
    weightPerCase: 25, // lbs

    // Inventory
    skus: [
      {
        id: 'HHZ-001',
        name: 'Single Bottle',
        unitsPerCase: 12,
        casesOnHand: 45,
      },
      {
        id: 'HHZ-012',
        name: '12 Pack',
        unitsPerCase: 1,
        casesOnHand: 80,
      },
      {
        id: 'HHZ-024',
        name: '24 Pack',
        unitsPerCase: 1,
        casesOnHand: 35,
      },
    ],

    status: 'active',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  Mock Orders — 15 sample orders for HH Zero
//  Status: 'pending' | 'printed' | 'shipped'
// ─────────────────────────────────────────────────────────────────────────────

export const ORDERS = [
  {
    id: 'ORD-2051',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8812',
    sku: 'HHZ-012',
    skuName: '12 Pack',
    quantity: 3,
    destination: 'Austin, TX 78701',
    shippingCost: 9.82,
    fulfillmentFee: 3.00,
    status: 'shipped',
    createdAt: '2026-04-25T09:14:00Z',
    shippedAt: '2026-04-25T11:30:00Z',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
  },
  {
    id: 'ORD-2050',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8811',
    sku: 'HHZ-001',
    skuName: 'Single Bottle',
    quantity: 6,
    destination: 'Denver, CO 80203',
    shippingCost: 7.14,
    fulfillmentFee: 3.00,
    status: 'shipped',
    createdAt: '2026-04-25T08:47:00Z',
    shippedAt: '2026-04-25T11:30:00Z',
    trackingNumber: '1Z999AA10123456783',
    carrier: 'UPS',
  },
  {
    id: 'ORD-2049',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8809',
    sku: 'HHZ-024',
    skuName: '24 Pack',
    quantity: 1,
    destination: 'New York, NY 10001',
    shippingCost: 12.55,
    fulfillmentFee: 3.00,
    status: 'printed',
    createdAt: '2026-04-25T07:22:00Z',
    shippedAt: null,
    trackingNumber: '9400111899223481778329',
    carrier: 'USPS',
  },
  {
    id: 'ORD-2048',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8807',
    sku: 'HHZ-012',
    skuName: '12 Pack',
    quantity: 2,
    destination: 'Seattle, WA 98101',
    shippingCost: 11.20,
    fulfillmentFee: 3.00,
    status: 'printed',
    createdAt: '2026-04-25T06:58:00Z',
    shippedAt: null,
    trackingNumber: '9400111899223481778328',
    carrier: 'USPS',
  },
  {
    id: 'ORD-2047',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8806',
    sku: 'HHZ-001',
    skuName: 'Single Bottle',
    quantity: 12,
    destination: 'Chicago, IL 60601',
    shippingCost: 8.90,
    fulfillmentFee: 3.00,
    status: 'pending',
    createdAt: '2026-04-25T06:31:00Z',
    shippedAt: null,
    trackingNumber: null,
    carrier: null,
  },
  {
    id: 'ORD-2046',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8804',
    sku: 'HHZ-024',
    skuName: '24 Pack',
    quantity: 2,
    destination: 'Miami, FL 33101',
    shippingCost: 14.37,
    fulfillmentFee: 3.00,
    status: 'pending',
    createdAt: '2026-04-25T05:44:00Z',
    shippedAt: null,
    trackingNumber: null,
    carrier: null,
  },
  {
    id: 'ORD-2045',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8801',
    sku: 'HHZ-012',
    skuName: '12 Pack',
    quantity: 4,
    destination: 'Phoenix, AZ 85001',
    shippingCost: 10.65,
    fulfillmentFee: 3.00,
    status: 'pending',
    createdAt: '2026-04-25T04:19:00Z',
    shippedAt: null,
    trackingNumber: null,
    carrier: null,
  },
  {
    id: 'ORD-2044',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8799',
    sku: 'HHZ-001',
    skuName: 'Single Bottle',
    quantity: 24,
    destination: 'Los Angeles, CA 90001',
    shippingCost: 13.40,
    fulfillmentFee: 3.00,
    status: 'shipped',
    createdAt: '2026-04-24T18:55:00Z',
    shippedAt: '2026-04-24T20:10:00Z',
    trackingNumber: '1Z999AA10123456782',
    carrier: 'UPS',
  },
  {
    id: 'ORD-2043',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8796',
    sku: 'HHZ-024',
    skuName: '24 Pack',
    quantity: 1,
    destination: 'Atlanta, GA 30301',
    shippingCost: 9.10,
    fulfillmentFee: 3.00,
    status: 'shipped',
    createdAt: '2026-04-24T16:22:00Z',
    shippedAt: '2026-04-24T17:45:00Z',
    trackingNumber: '1Z999AA10123456781',
    carrier: 'UPS',
  },
  {
    id: 'ORD-2042',
    clientId: 'hhzero',
    wixOrderId: 'WIX-8793',
    sku: 'HHZ-012',
    skuName: '12 Pack',
    quantity: 6,
    destination: 'Houston, TX 77001',
    shippingCost: 11.88,
    fulfillmentFee: 3.00,
    status: 'shipped',
    createdAt: '2026-04-24T14:07:00Z',
    shippedAt: '2026-04-24T15:30:00Z',
    trackingNumber: '1Z999AA10123456780',
    carrier: 'UPS',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getClient(id) {
  return CLIENTS.find(c => c.id === id) ?? null
}

/** Total cases on hand for a client */
export function totalCases(client) {
  return client.skus.reduce((sum, s) => sum + s.casesOnHand, 0)
}

/** Pallets used — always round up */
export function palletsUsed(client) {
  return Math.ceil(totalCases(client) / client.casesPerPallet)
}

/** Days until free storage expires (negative = already expired) */
export function storageDaysRemaining(client) {
  const end = new Date(client.storageFreeEnd)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
}

/** Percent of free storage period elapsed */
export function storageProgressPct(client) {
  const start = new Date(client.storageStart)
  const end = new Date(client.storageFreeEnd)
  const today = new Date()
  const total = end - start
  const elapsed = Math.min(today - start, total)
  return Math.round((elapsed / total) * 100)
}

/** Format ISO string to readable time */
export function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** Format ISO string to date */
export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/** Format ISO to relative age (e.g. "2h ago") */
export function fmtRelative(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/** Currency */
export function fmtUSD(n) {
  return `$${n.toFixed(2)}`
}
