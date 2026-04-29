import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import { CLIENTS } from '../data/mockData.js'
import { supabase } from '../lib/supabase.js'
import './AdminTools.css'

const TABS = ['Clients', 'SKUs & Dimensions', 'Recurring Charges', 'Logos']

export default function AdminTools() {
  const [activeTab, setActiveTab] = useState('Clients')

  return (
    <>
      <TopBar title="Admin Tools" subtitle="Manage clients, SKUs, billing, and settings" />
      <div className="page-content">
        <div className="at-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`at-tab${activeTab === tab ? ' at-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="at-body">
          {activeTab === 'Clients'            && <ClientsTab />}
          {activeTab === 'SKUs & Dimensions'  && <SKUsTab />}
          {activeTab === 'Recurring Charges'  && <RecurringTab />}
          {activeTab === 'Logos'              && <LogosTab />}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLIENTS TAB — create new client accounts
// ─────────────────────────────────────────────────────────────────────────────
function ClientsTab() {
  const [form, setForm] = useState({
    name: '', shortName: '', contact: '', email: '',
    password: '', fulfillmentFee: '3.00', billingCycleDays: '15',
    paymentMethod: 'Zelle / ACH', casesPerPallet: '70', weightPerCase: '25',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleCreate() {
    setLoading(true)
    setResult(null)

    try {
      // 1. Create auth user via Supabase admin
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
      })

      if (authErr) throw new Error(authErr.message)

      const userId = authData.user.id
      const clientId = form.name.toLowerCase().replace(/\s+/g, '')

      // 2. Insert client record
      const { error: clientErr } = await supabase.from('clients').insert({
        id: clientId,
        name: form.name,
        short_name: form.shortName,
        contact: form.contact,
        email: form.email,
        fulfillment_fee: parseFloat(form.fulfillmentFee),
        billing_cycle_days: parseInt(form.billingCycleDays),
        payment_method: form.paymentMethod,
        cases_per_pallet: parseInt(form.casesPerPallet),
        weight_per_case_lbs: parseInt(form.weightPerCase),
        storage_start: new Date().toISOString().split('T')[0],
        storage_free_end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        storage_billing_start: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        storage_cost_per_pallet: 20.00,
        status: 'active',
      })

      if (clientErr) throw new Error(clientErr.message)

      // 3. Insert profile
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: userId,
        role: 'client',
        client_id: clientId,
      })

      if (profileErr) throw new Error(profileErr.message)

      setResult({ ok: true, message: `Client "${form.name}" created. Login: ${form.email}` })
      setForm({
        name: '', shortName: '', contact: '', email: '',
        password: '', fulfillmentFee: '3.00', billingCycleDays: '15',
        paymentMethod: 'Zelle / ACH', casesPerPallet: '70', weightPerCase: '25',
      })
    } catch (err) {
      setResult({ ok: false, message: err.message })
    }

    setLoading(false)
  }

  return (
    <div className="at-section">
      <div className="at-section-header">
        <span className="at-section-title">Create New Client</span>
        <span className="at-section-sub">Sets up login credentials and client profile in one step</span>
      </div>

      <div className="at-form card">
        <div className="at-form-grid">
          <AtField label="Business Name" value={form.name} onChange={v => set('name', v)} placeholder="HH Zero" />
          <AtField label="Short Name" value={form.shortName} onChange={v => set('shortName', v)} placeholder="HHZ" />
          <AtField label="Contact Name" value={form.contact} onChange={v => set('contact', v)} placeholder="Denisa" />
          <AtField label="Email (login)" value={form.email} onChange={v => set('email', v)} placeholder="denisa@hhzero.com" type="email" />
          <AtField label="Password" value={form.password} onChange={v => set('password', v)} placeholder="Temporary password" type="password" />
          <AtField label="Fulfillment Fee" value={form.fulfillmentFee} onChange={v => set('fulfillmentFee', v)} placeholder="3.00" prefix="$" />
          <AtField label="Billing Cycle" value={form.billingCycleDays} onChange={v => set('billingCycleDays', v)} placeholder="15" suffix="days" />
          <AtField label="Payment Method" value={form.paymentMethod} onChange={v => set('paymentMethod', v)} placeholder="Zelle / ACH" />
          <AtField label="Cases per Pallet" value={form.casesPerPallet} onChange={v => set('casesPerPallet', v)} placeholder="70" />
          <AtField label="Weight per Case" value={form.weightPerCase} onChange={v => set('weightPerCase', v)} placeholder="25" suffix="lbs" />
        </div>

        <div className="at-form-footer">
          {result && (
            <div className={`at-result ${result.ok ? 'at-result--ok' : 'at-result--err'}`}>
              {result.message}
            </div>
          )}
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading || !form.name || !form.email || !form.password}>
            {loading ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </div>

      {/* Existing clients */}
      <div className="at-section-header" style={{ marginTop: 28 }}>
        <span className="at-section-title">Existing Clients</span>
      </div>
      <div className="at-clients-list">
        {CLIENTS.map(c => (
          <div key={c.id} className="at-client-row card">
            <div className="at-client-avatar">{c.shortName}</div>
            <div className="at-client-info">
              <span className="at-client-name">{c.name}</span>
              <span className="at-client-meta">{c.contact} · {c.email}</span>
            </div>
            <div className="at-client-stats">
              <span className="at-client-stat">${c.fulfillmentFee}/order</span>
              <span className="at-client-stat">{c.billingCycleDays}-day cycle</span>
              <span className="at-client-stat">{c.paymentMethod}</span>
            </div>
            <div className="at-client-status">
              <span className="at-status-dot" />
              Active
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SKUs TAB — dimensions, weight, inventory per client
// ─────────────────────────────────────────────────────────────────────────────
function SKUsTab() {
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0].id)
  const client = CLIENTS.find(c => c.id === selectedClient)

  const [skus, setSkus] = useState(
    client.skus.map(s => ({
      ...s,
      weightLbs: '',
      lengthIn: '',
      widthIn: '',
      heightIn: '',
      editing: false,
    }))
  )

  function updateSku(id, key, val) {
    setSkus(prev => prev.map(s => s.id === id ? { ...s, [key]: val } : s))
  }

  function toggleEdit(id) {
    setSkus(prev => prev.map(s => s.id === id ? { ...s, editing: !s.editing } : s))
  }

  const [newSku, setNewSku] = useState({ id: '', name: '', unitsPerCase: '', casesOnHand: '', weightLbs: '', lengthIn: '', widthIn: '', heightIn: '' })
  const [adding, setAdding] = useState(false)

  return (
    <div className="at-section">
      <div className="at-section-header">
        <span className="at-section-title">SKUs & Dimensions</span>
        <span className="at-section-sub">Weight and dimensions are used for automatic rate shopping</span>
      </div>

      {/* Client selector */}
      <div className="at-client-selector">
        {CLIENTS.map(c => (
          <button
            key={c.id}
            className={`filter-tab${selectedClient === c.id ? ' filter-tab--active' : ''}`}
            onClick={() => setSelectedClient(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="at-sku-table card">
        <table className="at-table">
          <thead>
            <tr>
              <th>SKU ID</th>
              <th>Name</th>
              <th className="align-right">Units/Case</th>
              <th className="align-right">Cases On Hand</th>
              <th className="align-right">Weight (lbs)</th>
              <th className="align-right">L × W × H (in)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {skus.map(sku => (
              <tr key={sku.id}>
                <td><span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{sku.id}</span></td>
                <td><span style={{ fontSize: 13 }}>{sku.name}</span></td>
                <td className="align-right"><span className="mono">{sku.unitsPerCase}</span></td>
                <td className="align-right">
                  {sku.editing ? (
                    <input className="at-inline-input" type="number" value={sku.casesOnHand} onChange={e => updateSku(sku.id, 'casesOnHand', e.target.value)} />
                  ) : (
                    <span className="mono" style={{ fontWeight: 600 }}>{sku.casesOnHand}</span>
                  )}
                </td>
                <td className="align-right">
                  {sku.editing ? (
                    <input className="at-inline-input" type="number" placeholder="0.0" value={sku.weightLbs} onChange={e => updateSku(sku.id, 'weightLbs', e.target.value)} />
                  ) : (
                    <span className="mono" style={{ color: sku.weightLbs ? 'var(--text)' : 'var(--text-dim)' }}>
                      {sku.weightLbs || '—'}
                    </span>
                  )}
                </td>
                <td className="align-right">
                  {sku.editing ? (
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                      <input className="at-inline-input" style={{ width: 44 }} placeholder="L" value={sku.lengthIn} onChange={e => updateSku(sku.id, 'lengthIn', e.target.value)} />
                      <input className="at-inline-input" style={{ width: 44 }} placeholder="W" value={sku.widthIn} onChange={e => updateSku(sku.id, 'widthIn', e.target.value)} />
                      <input className="at-inline-input" style={{ width: 44 }} placeholder="H" value={sku.heightIn} onChange={e => updateSku(sku.id, 'heightIn', e.target.value)} />
                    </div>
                  ) : (
                    <span className="mono" style={{ color: sku.lengthIn ? 'var(--text)' : 'var(--text-dim)' }}>
                      {sku.lengthIn ? `${sku.lengthIn}×${sku.widthIn}×${sku.heightIn}` : '—'}
                    </span>
                  )}
                </td>
                <td>
                  <button className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => toggleEdit(sku.id)}>
                    {sku.editing ? 'Save' : 'Edit'}
                  </button>
                </td>
              </tr>
            ))}

            {/* Add new SKU row */}
            {adding && (
              <tr className="at-new-sku-row">
                <td><input className="at-inline-input" placeholder="HHZ-048" value={newSku.id} onChange={e => setNewSku(s => ({ ...s, id: e.target.value }))} /></td>
                <td><input className="at-inline-input" placeholder="48 Pack" value={newSku.name} onChange={e => setNewSku(s => ({ ...s, name: e.target.value }))} /></td>
                <td className="align-right"><input className="at-inline-input" style={{ width: 60 }} type="number" placeholder="1" value={newSku.unitsPerCase} onChange={e => setNewSku(s => ({ ...s, unitsPerCase: e.target.value }))} /></td>
                <td className="align-right"><input className="at-inline-input" style={{ width: 60 }} type="number" placeholder="0" value={newSku.casesOnHand} onChange={e => setNewSku(s => ({ ...s, casesOnHand: e.target.value }))} /></td>
                <td className="align-right"><input className="at-inline-input" style={{ width: 60 }} type="number" placeholder="0.0" value={newSku.weightLbs} onChange={e => setNewSku(s => ({ ...s, weightLbs: e.target.value }))} /></td>
                <td className="align-right">
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <input className="at-inline-input" style={{ width: 44 }} placeholder="L" value={newSku.lengthIn} onChange={e => setNewSku(s => ({ ...s, lengthIn: e.target.value }))} />
                    <input className="at-inline-input" style={{ width: 44 }} placeholder="W" value={newSku.widthIn} onChange={e => setNewSku(s => ({ ...s, widthIn: e.target.value }))} />
                    <input className="at-inline-input" style={{ width: 44 }} placeholder="H" value={newSku.heightIn} onChange={e => setNewSku(s => ({ ...s, heightIn: e.target.value }))} />
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-primary" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => {
                      setSkus(prev => [...prev, { ...newSku, editing: false }])
                      setNewSku({ id: '', name: '', unitsPerCase: '', casesOnHand: '', weightLbs: '', lengthIn: '', widthIn: '', heightIn: '' })
                      setAdding(false)
                    }}>Add</button>
                    <button className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => setAdding(false)}>Cancel</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="at-table-footer">
          <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setAdding(true)}>
            + Add SKU
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  RECURRING CHARGES TAB
// ─────────────────────────────────────────────────────────────────────────────
function RecurringTab() {
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0].id)
  const [charges, setCharges] = useState([])
  const [form, setForm] = useState({ name: '', amount: '', unit: 'flat' })

  function addCharge() {
    if (!form.name || !form.amount) return
    setCharges(prev => [...prev, { ...form, id: Date.now(), active: true }])
    setForm({ name: '', amount: '', unit: 'flat' })
  }

  function toggleCharge(id) {
    setCharges(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c))
  }

  function removeCharge(id) {
    setCharges(prev => prev.filter(c => c.id !== id))
  }

  const unitLabel = { flat: 'flat/cycle', per_order: 'per order', per_unit: 'per unit' }

  return (
    <div className="at-section">
      <div className="at-section-header">
        <span className="at-section-title">Recurring Charges</span>
        <span className="at-section-sub">These charges auto-apply to every invoice for the selected client</span>
      </div>

      <div className="at-client-selector">
        {CLIENTS.map(c => (
          <button key={c.id} className={`filter-tab${selectedClient === c.id ? ' filter-tab--active' : ''}`} onClick={() => setSelectedClient(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Add charge */}
      <div className="at-charge-form card">
        <div className="at-charge-inputs">
          <div className="at-field">
            <label className="at-label">Charge Name</label>
            <input className="at-input" placeholder="e.g. Receiving Fee" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="at-field">
            <label className="at-label">Amount</label>
            <input className="at-input" placeholder="50.00" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ width: 120 }} />
          </div>
          <div className="at-field">
            <label className="at-label">Type</label>
            <select className="at-input at-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
              <option value="flat">Flat per cycle</option>
              <option value="per_order">Per order</option>
              <option value="per_unit">Per unit</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={addCharge}>
            Add Charge
          </button>
        </div>
      </div>

      {/* Charge list */}
      {charges.length === 0 ? (
        <div className="at-empty">No recurring charges set for this client.</div>
      ) : (
        <div className="at-charge-list">
          {charges.map(charge => (
            <div key={charge.id} className={`at-charge-row card${!charge.active ? ' at-charge-row--inactive' : ''}`}>
              <div className="at-charge-info">
                <span className="at-charge-name">{charge.name}</span>
                <span className="at-charge-type">{unitLabel[charge.unit]}</span>
              </div>
              <span className="mono at-charge-amount">${parseFloat(charge.amount).toFixed(2)}</span>
              <div className="at-charge-actions">
                <button className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => toggleCharge(charge.id)}>
                  {charge.active ? 'Disable' : 'Enable'}
                </button>
                <button className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 8px', color: 'var(--error)' }} onClick={() => removeCharge(charge.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  LOGOS TAB
// ─────────────────────────────────────────────────────────────────────────────
function LogosTab() {
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0].id)
  const [preview, setPreview]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult]     = useState(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview({ file, url })
    setResult(null)
  }

  async function handleUpload() {
    if (!preview?.file) return
    setUploading(true)
    setResult(null)

    try {
      const ext = preview.file.name.split('.').pop()
      const path = `${selectedClient}/logo.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('logos')
        .upload(path, preview.file, { upsert: true })

      if (uploadErr) throw new Error(uploadErr.message)

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)

      const { error: updateErr } = await supabase
        .from('clients')
        .update({ logo_url: publicUrl })
        .eq('id', selectedClient)

      if (updateErr) throw new Error(updateErr.message)

      setResult({ ok: true, message: 'Logo uploaded and saved.' })
    } catch (err) {
      setResult({ ok: false, message: err.message })
    }

    setUploading(false)
  }

  const client = CLIENTS.find(c => c.id === selectedClient)

  return (
    <div className="at-section">
      <div className="at-section-header">
        <span className="at-section-title">Client Logos</span>
        <span className="at-section-sub">Logos appear on shipping labels and invoice emails</span>
      </div>

      <div className="at-client-selector">
        {CLIENTS.map(c => (
          <button key={c.id} className={`filter-tab${selectedClient === c.id ? ' filter-tab--active' : ''}`} onClick={() => setSelectedClient(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="at-logo-panel card">
        {/* Label preview mockup */}
        <div className="at-label-preview">
          <span className="section-label" style={{ marginBottom: 12, display: 'block' }}>Label Preview</span>
          <div className="at-label-mockup">
            <div className="at-label-header">
              {preview ? (
                <img src={preview.url} alt="Logo preview" className="at-label-logo" />
              ) : (
                <div className="at-label-logo-placeholder">
                  <span>{client?.shortName}</span>
                </div>
              )}
              <div className="at-label-from">
                <span className="at-label-from-name">{client?.name}</span>
                <span className="at-label-from-addr">c/o Rover Fulfillment LLC</span>
                <span className="at-label-from-addr">Chantilly, VA 20151</span>
              </div>
            </div>
            <div className="at-label-divider" />
            <div className="at-label-to">
              <span className="at-label-to-label">SHIP TO:</span>
              <span className="at-label-to-name">Customer Name</span>
              <span className="at-label-to-addr">123 Main Street</span>
              <span className="at-label-to-addr">City, ST 00000</span>
            </div>
            <div className="at-label-barcode">
              <div className="at-barcode-lines">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className="at-barcode-bar" style={{ width: i % 3 === 0 ? 3 : 1 }} />
                ))}
              </div>
              <span className="at-barcode-num mono">9400 1118 9922 3481 7783 29</span>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div className="at-logo-upload">
          <span className="section-label" style={{ marginBottom: 12, display: 'block' }}>Upload Logo</span>
          <label className="at-upload-zone">
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            {preview ? (
              <img src={preview.url} alt="Preview" style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain' }} />
            ) : (
              <>
                <span className="at-upload-icon">↑</span>
                <span className="at-upload-text">Click to upload PNG or JPG</span>
                <span className="at-upload-sub">Recommended: 400×200px, transparent background</span>
              </>
            )}
          </label>

          {result && (
            <div className={`at-result ${result.ok ? 'at-result--ok' : 'at-result--err'}`} style={{ marginTop: 12 }}>
              {result.message}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={handleUpload}
            disabled={!preview || uploading}
          >
            {uploading ? 'Uploading...' : 'Save Logo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Shared field component
// ─────────────────────────────────────────────────────────────────────────────
function AtField({ label, value, onChange, placeholder, type = 'text', prefix, suffix }) {
  return (
    <div className="at-field">
      <label className="at-label">{label}</label>
      <div className="at-input-wrap">
        {prefix && <span className="at-input-prefix">{prefix}</span>}
        <input
          className={`at-input${prefix ? ' at-input--prefix' : ''}${suffix ? ' at-input--suffix' : ''}`}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {suffix && <span className="at-input-suffix">{suffix}</span>}
      </div>
    </div>
  )
}
