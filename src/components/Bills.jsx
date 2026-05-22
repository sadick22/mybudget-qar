import React, { useState } from 'react'
import { PlusCircle, Trash2, Bell, BellOff, CheckCircle, AlertCircle, Calendar, RefreshCw } from 'lucide-react'
import { fmt, getDaysUntil } from '../data.js'

const DEFAULT_BILLS = [
  { id: 1, name: 'Rent', amount: 3500, dueDay: 1, category: 'Housing', icon: '🏠', color: '#60a5fa', recurring: true, paid: false, autoPay: false },
  { id: 2, name: 'Credit Card Minimum', amount: 1180, dueDay: 9, category: 'Debt', icon: '💳', color: '#f87171', recurring: true, paid: true, autoPay: true },
  { id: 3, name: 'Credit Shield Insurance', amount: 99.48, dueDay: 24, category: 'Insurance', icon: '🛡️', color: '#fbbf24', recurring: true, paid: false, autoPay: true },
]

const CATEGORIES = ['Housing', 'Debt', 'Insurance', 'Utilities', 'Subscriptions', 'Phone', 'Internet', 'Transport', 'Other']
const ICONS = ['🏠', '💳', '📱', '💡', '🌐', '🚗', '🛡️', '🎵', '📺', '🎮', '💊', '✈️', '🏋️', '📚']

export default function Bills({ data, setData }) {
  const [bills, setBills] = useState(data.bills || DEFAULT_BILLS)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', dueDay: '', category: 'Utilities', icon: '💡', color: '#60a5fa', recurring: true, autoPay: false })
  const [filterCat, setFilterCat] = useState('All')

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  function getDueDate(dueDay) {
    const dueDate = new Date(currentYear, currentMonth, dueDay)
    if (dueDate < now) return new Date(currentYear, currentMonth + 1, dueDay)
    return dueDate
  }

  function getDueDays(dueDay) {
    return getDaysUntil(getDueDate(dueDay).toISOString().slice(0, 10))
  }

  function getStatus(bill) {
    if (bill.paid) return { label: 'Paid', color: 'var(--green)', bg: 'rgba(74,222,128,0.1)' }
    const days = getDueDays(bill.dueDay)
    if (days < 0) return { label: 'Overdue', color: 'var(--red)', bg: 'rgba(248,113,113,0.1)' }
    if (days <= 3) return { label: `Due in ${days}d`, color: 'var(--red)', bg: 'rgba(248,113,113,0.1)' }
    if (days <= 7) return { label: `Due in ${days}d`, color: 'var(--yellow)', bg: 'rgba(251,191,36,0.1)' }
    return { label: `Due in ${days}d`, color: 'var(--text2)', bg: 'var(--bg3)' }
  }

  function saveBills(newBills) {
    setBills(newBills)
    setData({ ...data, bills: newBills })
  }

  function togglePaid(id) {
    saveBills(bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b))
  }

  function deleteBill(id) {
    saveBills(bills.filter(b => b.id !== id))
  }

  function addBill() {
    if (!form.name || !form.amount || !form.dueDay) return
    const newBill = { ...form, id: Date.now(), amount: parseFloat(form.amount), dueDay: parseInt(form.dueDay), paid: false }
    saveBills([...bills, newBill])
    setShowAdd(false)
    setForm({ name: '', amount: '', dueDay: '', category: 'Utilities', icon: '💡', color: '#60a5fa', recurring: true, autoPay: false })
  }

  function resetMonthly() {
    saveBills(bills.map(b => ({ ...b, paid: false })))
  }

  const filtered = filterCat === 'All' ? bills : bills.filter(b => b.category === filterCat)
  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0)
  const totalPaid = bills.filter(b => b.paid).reduce((s, b) => s + b.amount, 0)
  const totalUnpaid = bills.filter(b => !b.paid).reduce((s, b) => s + b.amount, 0)
  const overdueCount = bills.filter(b => !b.paid && getDueDays(b.dueDay) < 0).length
  const dueSoonCount = bills.filter(b => !b.paid && getDueDays(b.dueDay) >= 0 && getDueDays(b.dueDay) <= 7).length

  const upcomingBills = bills
    .filter(b => !b.paid)
    .map(b => ({ ...b, days: getDueDays(b.dueDay) }))
    .sort((a, b) => a.days - b.days)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Bills & Subscriptions</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Track every recurring payment — never miss a due date</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={resetMonthly} style={{ fontSize: 13 }}>
            <RefreshCw size={14} /> New Month
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
            <PlusCircle size={15} /> Add Bill
          </button>
        </div>
      </div>

      {/* Alerts */}
      {(overdueCount > 0 || dueSoonCount > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {overdueCount > 0 && (
            <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
              <AlertCircle size={16} color="var(--red)" />
              <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>{overdueCount} bill{overdueCount > 1 ? 's are' : ' is'} overdue — pay immediately!</span>
            </div>
          )}
          {dueSoonCount > 0 && (
            <div style={{ padding: '12px 16px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
              <Bell size={16} color="var(--yellow)" />
              <span style={{ fontSize: 13, color: 'var(--yellow)', fontWeight: 500 }}>{dueSoonCount} bill{dueSoonCount > 1 ? 's' : ''} due within 7 days</span>
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Monthly Bills', value: fmt(totalMonthly), color: 'var(--text)' },
          { label: 'Paid This Month', value: fmt(totalPaid), color: 'var(--green)' },
          { label: 'Still to Pay', value: fmt(totalUnpaid), color: 'var(--red)' },
          { label: '% of Salary', value: `${((totalMonthly / data.profile.salary) * 100).toFixed(0)}%`, color: 'var(--yellow)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Timeline */}
      {upcomingBills.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>📅 Upcoming Payments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {upcomingBills.slice(0, 5).map((bill, i) => {
              const status = getStatus(bill)
              return (
                <div key={bill.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < Math.min(upcomingBills.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${bill.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {bill.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{bill.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Due {bill.dueDay}{getDaySuffix(bill.dueDay)} of month</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(bill.amount)}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: status.bg, color: status.color, fontWeight: 500 }}>
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="card" style={{ border: '1px solid rgba(200,169,110,0.3)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 14 }}>Add New Bill / Subscription</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Bill Name</label>
              <input type="text" placeholder="e.g. Netflix" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Amount (QAR)</label>
              <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Due Day (1-31)</label>
              <input type="number" min={1} max={31} placeholder="e.g. 1" value={form.dueDay} onChange={e => setForm({ ...form, dueDay: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Icon</label>
              <select value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}>
                {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Color</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                style={{ height: 42, cursor: 'pointer', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.autoPay} onChange={e => setForm({ ...form, autoPay: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
              Auto-pay enabled
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={addBill}>Add Bill</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: 'none',
              background: filterCat === cat ? 'var(--accent)' : 'var(--bg3)',
              color: filterCat === cat ? '#0f1117' : 'var(--text2)',
              fontWeight: filterCat === cat ? 600 : 400,
              transition: 'all 0.2s',
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Bills List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No bills in this category</div>
        ) : (
          filtered.map((bill, i) => {
            const status = getStatus(bill)
            return (
              <div key={bill.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                background: bill.paid ? 'rgba(74,222,128,0.04)' : 'transparent',
                transition: 'background 0.15s',
              }}>
                <button onClick={() => togglePaid(bill.id)} style={{ background: 'none', color: bill.paid ? 'var(--green)' : 'var(--text3)', flexShrink: 0, transition: 'color 0.2s', border: 'none', cursor: 'pointer' }}>
                  <CheckCircle size={22} />
                </button>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${bill.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {bill.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500, fontSize: 14, textDecoration: bill.paid ? 'line-through' : 'none', color: bill.paid ? 'var(--text3)' : 'var(--text)' }}>
                      {bill.name}
                    </span>
                    {bill.autoPay && (
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: 'rgba(96,165,250,0.15)', color: 'var(--blue)', fontWeight: 600 }}>
                        AUTO
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                    {bill.category} · Due {bill.dueDay}{getDaySuffix(bill.dueDay)} every month
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: bill.paid ? 'var(--text3)' : 'var(--text)', marginBottom: 4 }}>
                    {fmt(bill.amount)}
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 10, background: status.bg, color: status.color, fontWeight: 500 }}>
                    {status.label}
                  </span>
                </div>
                <button onClick={() => deleteBill(bill.id)} style={{ background: 'none', color: 'var(--text3)', padding: 4, borderRadius: 6, flexShrink: 0, border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Monthly cost breakdown */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Cost by Category</h3>
        {Object.entries(
          bills.reduce((acc, b) => { acc[b.category] = (acc[b.category] || 0) + b.amount; return acc }, {})
        ).sort((a, b) => b[1] - a[1]).map(([cat, amount], i) => {
          const pct = (amount / totalMonthly) * 100
          return (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>{cat}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(amount)} <span style={{ color: 'var(--text3)', fontWeight: 400 }}>({pct.toFixed(0)}%)</span></span>
              </div>
              <div className="progress-bar" style={{ height: 5 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getDaySuffix(day) {
  if (day >= 11 && day <= 13) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}
