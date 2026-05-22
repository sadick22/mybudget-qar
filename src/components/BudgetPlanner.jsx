import React, { useState, useMemo } from 'react'
import { PlusCircle, Trash2, Edit2, Check } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { fmt } from '../data.js'

export default function BudgetPlanner({ data, setData }) {
  const { budget, transactions, profile } = data
  const [editingId, setEditingId] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', budgeted: '', color: '#60a5fa', icon: '📌' })

  const currentMonth = new Date().toISOString().slice(0, 7)

  const categoryStats = useMemo(() => {
    return budget.categories.map(cat => {
      const spent = transactions
        .filter(t => t.category === cat.name && t.date.startsWith(currentMonth) && t.type === 'expense')
        .reduce((s, t) => s + Math.abs(t.amount), 0)
      const pct = cat.budgeted > 0 ? (spent / cat.budgeted) * 100 : 0
      const remaining = cat.budgeted - spent
      return { ...cat, spent, pct, remaining }
    })
  }, [budget.categories, transactions, currentMonth])

  const totalBudgeted = budget.categories.reduce((s, c) => s + c.budgeted, 0)
  const totalSpent = categoryStats.reduce((s, c) => s + c.spent, 0)

  function saveEdit(id) {
    const updated = budget.categories.map(c => c.id === id ? { ...c, budgeted: parseFloat(editVal) } : c)
    setData({ ...data, budget: { ...budget, categories: updated } })
    setEditingId(null)
  }

  function deleteCategory(id) {
    setData({ ...data, budget: { ...budget, categories: budget.categories.filter(c => c.id !== id) } })
  }

  function addCategory() {
    if (!form.name || !form.budgeted) return
    const c = { ...form, id: Date.now(), budgeted: parseFloat(form.budgeted) }
    setData({ ...data, budget: { ...budget, categories: [...budget.categories, c] } })
    setShowAdd(false)
    setForm({ name: '', budgeted: '', color: '#60a5fa', icon: '📌' })
  }

  const pieData = categoryStats.map(c => ({ name: c.name, value: c.budgeted, color: c.color }))
  const barData = categoryStats.map(c => ({ name: c.name.split(' ')[0], Budgeted: c.budgeted, Spent: c.spent }))

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Budget Planner</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Monthly budget for {new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <PlusCircle size={15} /> Add Category
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Monthly Salary', value: fmt(profile.salary), color: 'var(--green)' },
          { label: 'Total Budgeted', value: fmt(totalBudgeted), color: 'var(--accent)' },
          { label: 'Total Spent', value: fmt(totalSpent), color: 'var(--red)' },
          { label: 'Unallocated', value: fmt(profile.salary - totalBudgeted), color: profile.salary - totalBudgeted >= 0 ? 'var(--green)' : 'var(--red)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Add Category */}
      {showAdd && (
        <div className="card" style={{ border: '1px solid rgba(200,169,110,0.3)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 14 }}>New Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Name</label>
              <input type="text" placeholder="e.g. Healthcare" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Monthly Budget (QAR)</label>
              <input type="number" placeholder="0.00" value={form.budgeted} onChange={e => setForm({ ...form, budgeted: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Icon (emoji)</label>
              <input type="text" placeholder="📌" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Color</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                style={{ height: 42, cursor: 'pointer', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={addCategory}>Add Category</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Budget Categories Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 15 }}>
          Category Breakdown
        </div>
        {categoryStats.map((cat, i) => (
          <div key={cat.id} style={{ padding: '16px 20px', borderBottom: i < categoryStats.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {cat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{cat.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {editingId === cat.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                          style={{ width: 100, fontSize: 13, padding: '4px 8px' }} autoFocus />
                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => saveEdit(cat.id)}>
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                          {fmt(cat.spent)} / <strong style={{ color: 'var(--text)' }}>{fmt(cat.budgeted)}</strong>
                        </span>
                        <span className={`badge ${cat.pct > 100 ? 'badge-red' : cat.pct > 80 ? 'badge-yellow' : 'badge-green'}`}>
                          {cat.pct.toFixed(0)}%
                        </span>
                        <button onClick={() => { setEditingId(cat.id); setEditVal(cat.budgeted) }} style={{ background: 'none', color: 'var(--text3)', padding: 4 }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} style={{ background: 'none', color: 'var(--text3)', padding: 4 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="progress-bar" style={{ height: 7 }}>
              <div className="progress-fill" style={{ width: `${Math.min(cat.pct, 100)}%`, background: cat.pct > 100 ? 'var(--red)' : cat.pct > 80 ? 'var(--yellow)' : cat.color }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: 'var(--text3)' }}>
              <span>Spent: {fmt(cat.spent)}</span>
              <span style={{ color: cat.remaining < 0 ? 'var(--red)' : 'var(--green)' }}>
                {cat.remaining >= 0 ? `${fmt(cat.remaining)} left` : `${fmt(Math.abs(cat.remaining))} over`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Budget Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => `QAR ${v.toFixed(0)}`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Budget vs Actual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barGap={2}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text3)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text3)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `QAR ${v.toFixed(0)}`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Budgeted" fill="var(--accent)" radius={[3, 3, 0, 0]} opacity={0.6} />
              <Bar dataKey="Spent" fill="var(--blue)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
