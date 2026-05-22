import React, { useState, useMemo } from 'react'
import { PlusCircle, Search, Download, Trash2, RefreshCw } from 'lucide-react'
import { fmt, exportCSV, CATEGORIES } from '../data.js'

export default function Transactions({ data, setData }) {
  const { transactions } = data
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '', amount: '', category: 'Food & Groceries',
    type: 'expense', recurring: false,
  })

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())
        const matchCat = filterCat === 'All' || t.category === filterCat
        const matchType = filterType === 'All' || t.type === filterType
        return matchSearch && matchCat && matchType
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions, search, filterCat, filterType])

  function addTransaction() {
    if (!form.description || !form.amount) return
    const t = {
      ...form,
      id: Date.now(),
      amount: form.type === 'expense' ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)),
    }
    setData({ ...data, transactions: [t, ...transactions] })
    setShowAdd(false)
    setForm({ date: new Date().toISOString().slice(0, 10), description: '', amount: '', category: 'Food & Groceries', type: 'expense', recurring: false })
  }

  function deleteTransaction(id) {
    setData({ ...data, transactions: transactions.filter(t => t.id !== id) })
  }

  const totalIn = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalOut = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Transactions</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{filtered.length} transactions</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => exportCSV(transactions)}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
            <PlusCircle size={15} /> Add
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Total In</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--green)' }}>{fmt(totalIn)}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Total Out</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--red)' }}>{fmt(totalOut)}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Net</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: totalIn - totalOut >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmt(totalIn - totalOut)}</div>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="card" style={{ border: '1px solid rgba(200,169,110,0.3)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 14 }}>New Transaction</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Description</label>
              <input type="text" placeholder="e.g. Lulu Hypermarket" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Amount (QAR)</label>
              <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                Recurring
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={addTransaction}>Add Transaction</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
          <input type="text" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }} />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto' }}>
          <option value="All">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Transaction List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No transactions found</div>
        ) : (
          filtered.map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: t.type === 'income' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {getCategoryIcon(t.category)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t.description}
                  {t.recurring && <RefreshCw size={11} color="var(--text3)" />}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.category} · {t.date}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: t.type === 'income' ? 'var(--green)' : 'var(--red)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {t.type === 'income' ? '+' : '-'}{fmt(Math.abs(t.amount))}
              </div>
              <button onClick={() => deleteTransaction(t.id)} style={{ background: 'none', color: 'var(--text3)', padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function getCategoryIcon(cat) {
  const icons = {
    'Rent': '🏠', 'Food & Groceries': '🛒', 'Transport': '🚗',
    'Personal & Misc': '🛍️', 'Credit Card Payment': '💳',
    'Emergency Buffer': '🛡️', 'Healthcare': '🏥', 'Entertainment': '🎬',
    'Clothing': '👔', 'Education': '📚', 'Income': '💰', 'Other': '📌',
  }
  return icons[cat] || '📌'
}
