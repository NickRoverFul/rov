// src/lib/utils.js — shared helpers (moved from mockData.js)

/** Total cases on hand for a client (skus array must be attached) */
export function totalCases(client) {
  return (client.skus ?? []).reduce((sum, s) => sum + (s.cases_on_hand ?? 0), 0)
}

/** Pallets used — always round up */
export function palletsUsed(client) {
  const cpp = client.cases_per_pallet ?? 70
  return Math.ceil(totalCases(client) / cpp)
}

/** Days until free storage expires (negative = already expired) */
export function storageDaysRemaining(client) {
  const end = new Date(client.storage_free_end)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
}

/** Percent of free storage period elapsed */
export function storageProgressPct(client) {
  const start = new Date(client.storage_start)
  const end   = new Date(client.storage_free_end)
  const today = new Date()
  const total   = end - start
  const elapsed = Math.min(today - start, total)
  return Math.round((elapsed / total) * 100)
}

/** Format ISO string to HH:MM */
export function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

/** Format ISO string to "Apr 25" */
export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

/** Format ISO to relative age ("2h ago") */
export function fmtRelative(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

/** Format number as $X.XX */
export function fmtUSD(n) {
  return `$${Number(n ?? 0).toFixed(2)}`
}
