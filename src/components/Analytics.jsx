import React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts'
import { fmt, getMonthName } from '../data.js'

export default function Analytics({ data }) {
  const { monthlyHistory, transactions, creditCard } = data

  const barData = monthlyHistory.map(m => ({
    month: getMonthName(m.month),
    Income: m.income,
    Expenses: Object.values(m.expenses).reduce((s, v) => s + v, 0),
    Fees: m.fees,
  }))

  const balanceData = monthlyHistory.map(m => ({
    month: getMonthName(m.month),
    Balance: m.cardBalance,
  }))

  const feeData = monthlyHistory.map(m => ({
    month: getMonthName(m.month),
    Fees: m.fees,
  }))

  const totalFees = creditCard.fees.reduce((s, f) => s + f.amount, 0)
  const avgMonthlyFees = monthlyHistory.reduce((s, m) => s + m.fees, 0) / monthlyHistory.length

  const catSpend = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + Math.abs(t.amount)
  })
  const catData = Object.entries(catSpend).map(([name, value]) => ({ name, value }))
  const COLORS = ['#60a5fa', '#4ade80', '#fbbf24', '#f87171', '#a78bfa', '#c8a96e', '#fb923c']

  const totalIncome = monthlyHistory.reduce((s, m) => s + m.income, 0)
  const totalExpenses = monthlyHistory.reduce((s, m) => s + Object.values(m.expenses).reduce((a, b) => a + b, 0), 0)
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Analytics</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Your financial overview across all months</p>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Income (tracked)', value: fmt(totalIncome), color: 'var(--green)' },
          { label: 'Total Expenses (tracked)', value: fmt(totalExpenses), color: 'var(--red)' },
          { label: 'Savings Rate', value: `${savingsRate}%`, color: Number(savingsRate) > 20 ? 'var(--green)' : 'var(--yellow)' },
          { label: 'Avg Monthly Fees to Bank', value: fmt(avgMonthlyFees), color: 'var(--red)' },
          { label: 'Total Fees Paid (This Cycle)', value: fmt(totalFees), color: 'var(--red)' },
          { label: 'Debt-to-Income Ratio', value: `${((creditCard.balance / data.profile.salary) * 100).toFixed(0)}%`, color: 'var(--yellow)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Income vs Expenses */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Income vs Expenses by Month</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} barGap={4}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text3)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text3)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => `QAR ${v.toLocaleString()}`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Income" fill="var(--green)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill="var(--red)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Fees" fill="var(--yellow)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Card Balance Trend */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Credit Card Balance Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={balanceData}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text3)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text3)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} domain={[0, 16000]} />
            <Tooltip formatter={v => `QAR ${v.toLocaleString()}`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Line type="monotone" dataKey="Balance" stroke="var(--red)" strokeWidth={2.5} dot={{ fill: 'var(--red)', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(74,222,128,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--text2)' }}>
          ✅ Balance dropped from QAR 15,227 to QAR 14,223 — keep going!
        </div>
      </div>

      {/* Spending by Category */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={3}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `QAR ${v.toFixed(2)}`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Category Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {catData.sort((a, b) => b.value - a.value).map((d, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                    {d.name}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{fmt(d.value)}</span>
                </div>
                <div className="progress-bar" style={{ height: 4 }}>
                  <div className="progress-fill" style={{ width: `${(d.value / catData.reduce((s, x) => s + x.value, 0)) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fees Cost */}
      <div className="card" style={{ border: '1px solid rgba(248,113,113,0.2)' }}>
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>💸 What Bank Fees Are Costing You</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {[
            { label: 'This Month in Fees', value: fmt(totalFees) },
            { label: 'Credit Shield / Year', value: fmt(99.48 * 12) },
            { label: 'Interest / Year (est.)', value: fmt(creditCard.balance * creditCard.monthlyInterestRate * 12) },
            { label: 'Total Saved if Cancelled', value: fmt(99.48 * 12 + creditCard.balance * creditCard.monthlyInterestRate * 12) },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px', background: 'rgba(248,113,113,0.06)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--red)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
