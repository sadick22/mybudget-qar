import React, { useState } from 'react'
import { Save, Download, Upload, Trash2, Sun, Moon } from 'lucide-react'
import Savings from './components/Savings.jsx'
import { exportJSON, defaultData } from '../data.js'

export default function Settings({ data, setData }) {
  const { profile } = data
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ ...profile })

  function saveProfile() {
    setData({ ...data, profile: { ...form, salary: parseFloat(form.salary) } })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function toggleTheme() {
    const newTheme = profile.theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', newTheme)
    setData({ ...data, profile: { ...profile, theme: newTheme } })
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result)
        setData(imported)
        alert('Data imported successfully!')
      } catch {
        alert('Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  function resetData() {
    if (confirm('Are you sure? This will reset ALL your data to defaults.')) {
      setData(defaultData)
      localStorage.removeItem('mybudget_qar')
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Settings</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Manage your profile and app preferences</p>
      </div>

      {/* Profile */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Profile & Salary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Your Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Monthly Salary (QAR)</label>
            <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Payday (Day of Month)</label>
            <input type="number" min={1} max={31} value={form.payday} onChange={e => setForm({ ...form, payday: parseInt(e.target.value) })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Currency</label>
            <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
              <option value="QAR">QAR — Qatari Riyal</option>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="EUR">EUR — Euro</option>
              <option value="AED">AED — UAE Dirham</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={saveProfile}>
          <Save size={15} /> {saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </div>

      {/* Credit Card Settings */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Credit Card Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { label: 'Credit Limit (QAR)', key: 'limit', val: data.creditCard.limit },
            { label: 'Current Balance (QAR)', key: 'balance', val: data.creditCard.balance },
            { label: 'Monthly Insurance Fee (QAR)', key: 'monthlyInsurance', val: data.creditCard.monthlyInsurance },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input type="number" defaultValue={f.val}
                onChange={e => setData({ ...data, creditCard: { ...data.creditCard, [f.key]: parseFloat(e.target.value) } })} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Payment Due Date</label>
            <input type="date" value={data.creditCard.dueDate}
              onChange={e => setData({ ...data, creditCard: { ...data.creditCard, dueDate: e.target.value } })} />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {profile.theme === 'dark' ? <Moon size={18} color="var(--accent)" /> : <Sun size={18} color="var(--yellow)" />}
            <div>
              <div style={{ fontWeight: 500 }}>{profile.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Toggle between dark and light theme</div>
            </div>
          </div>
          <button onClick={toggleTheme} style={{
            width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer', position: 'relative',
            background: profile.theme === 'dark' ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute',
              top: 3, left: profile.theme === 'dark' ? 27 : 3, transition: 'left 0.3s',
            }} />
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 18 }}>Data Management</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10 }}>
            <div>
              <div style={{ fontWeight: 500 }}>Export Backup</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Download all your data as a JSON file</div>
            </div>
            <button className="btn btn-ghost" onClick={() => exportJSON(data)} style={{ fontSize: 13 }}>
              <Download size={14} /> Export
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg3)', borderRadius: 10 }}>
            <div>
              <div style={{ fontWeight: 500 }}>Import Backup</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Restore data from a JSON backup file</div>
            </div>
            <label className="btn btn-ghost" style={{ fontSize: 13, cursor: 'pointer' }}>
              <Upload size={14} /> Import
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(248,113,113,0.06)', borderRadius: 10, border: '1px solid rgba(248,113,113,0.2)' }}>
            <div>
              <div style={{ fontWeight: 500, color: 'var(--red)' }}>Reset All Data</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>This cannot be undone — export a backup first</div>
            </div>
            <button className="btn btn-danger" style={{ fontSize: 13 }} onClick={resetData}>
              <Trash2 size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card" style={{ textAlign: 'center', padding: '28px 24px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 6 }}>MyBudget QAR</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Version 1.0.0</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Built for Sadick · Doha, Qatar 🇶🇦</div>
        <div style={{ marginTop: 14, padding: '10px 16px', background: 'rgba(200,169,110,0.08)', borderRadius: 8, fontSize: 12, color: 'var(--accent)' }}>
          💡 Tip: Export a backup every month to keep your financial history safe.
        </div>
      </div>
    </div>
  )
}
