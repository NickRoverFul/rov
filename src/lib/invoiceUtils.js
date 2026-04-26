// src/lib/invoiceUtils.js
// Invoice generation and calculation utilities

/**
 * Generate a new invoice object from a client and their orders
 */
export function generateInvoice(client, orders, invoiceNumber, storageFee = 0) {
  const now = new Date()
  const periodEnd = new Date(now)
  const periodStart = new Date(now)
  periodStart.setDate(periodStart.getDate() - client.billing_cycle_days)

  const periodLabel = `${fmtDateShort(periodStart)} – ${fmtDateShort(periodEnd)}`

  const totalShipping    = orders.reduce((s, o) => s + Number(o.shipping_cost ?? 0), 0)
  const totalFulfillment = orders.reduce((s, o) => s + Number(o.fulfillment_fee ?? 0), 0)
  const totalDue         = totalShipping + totalFulfillment + storageFee

  return {
    id:                invoiceNumber,
    invoice_number:    invoiceNumber,
    client_id:         client.id,
    period_start:      periodStart.toISOString().split('T')[0],
    period_end:        periodEnd.toISOString().split('T')[0],
    period_label:      periodLabel,
    orders:            orders,
    total_shipping:    totalShipping,
    total_fulfillment: totalFulfillment,
    total_storage:     storageFee,
    total_due:         totalDue,
    notes:             '',
    status:            'draft',
  }
}

/**
 * Generate next invoice number — e.g. INV-2026-004
 */
export function nextInvoiceNumber(existingInvoices) {
  const year = new Date().getFullYear()
  const nums = existingInvoices
    .map(i => parseInt(i.id?.split('-')[2] ?? '0'))
    .filter(n => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `INV-${year}-${String(next).padStart(3, '0')}`
}

function fmtDateShort(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function fmtCurrency(n) {
  return `$${Number(n).toFixed(2)}`
}

export const STATUS_CONFIG = {
  draft:   { label: 'DRAFT',   color: 'var(--text-muted)',  bg: 'var(--surface-3)' },
  sent:    { label: 'SENT',    color: 'var(--printed)',     bg: 'var(--printed-bg)' },
  paid:    { label: 'PAID',    color: 'var(--shipped)',     bg: 'var(--shipped-bg)' },
  overdue: { label: 'OVERDUE', color: 'var(--error)',       bg: 'var(--error-bg)' },
}
