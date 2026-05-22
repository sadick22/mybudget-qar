import React, { useState } from 'react'
import { CreditCard, TrendingDown, AlertCircle, Calculator, PlusCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fmt } from '../data.js'

export default function CreditCardTracker({ data, setData }) {
  const { creditCard } = data
  const [payExtra, setPayExtra] = useState(2500)
  const [addPayment, setAddPayment] = useState(false)
  const [newPayment, setNewPayment] = useState({ date: new Date().toISOString().slice(0, 10), amount: '', note: '' })

  const usagePercent = (creditCard.balance / creditCard.limit) * 100
  const monthlyFees = creditCard.monthlyInsurance + (creditCard.balance * creditCard.monthlyInterestRate)
  const monthsToPayoff = calculatePayoff(creditCard.balance, payExtra, monthlyFees)

  function calculatePayoff(balance, monthly, fees) {
    if (monthly <= fees) return Infinity
    let b = balance
    let months = 0
    while (b > 0 && months < 120) {
      b = b + fees - monthly
      months++
    }
    return months
  }

  function getPayoffData(balance, monthly, fees) {
    let b = balance
    const points = []
    for (let i = 0; i <= Math.min(calculatePayoff(balance, monthly, fees) + 1, 24); i++) {
      points.push({ month: `M${i}`, balance: Math.max(0, Math.round(b)) })
      b = b + fees - monthly
      if (b <= 0) break
    }
    return points
  }

  const payoffData = getPayoffData(creditCard.balance, payExtra, monthlyFees)

  function handleAddPayment() {
    if (!newPayment.amount) return
    const updated = {
      ...data,
      creditCard: {
        ...creditCard,
        balance: Math.max(0, creditCard.balance - parseFloat(newPayment.amount)),
        payments: [{ ...newPayment, amount: parseFloat(newPayment.amount) }, ...creditCard.payments],
      }
    }
    setData(updated)
    setAddPayment(false)
    setNewPayment({ date: new Date().toISOString().slice(0, 10), amount: '', note: '' })
  }

  const totalFeesPaid = creditCard.fees.reduce((s, f) => s + f.amount, 0)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Credit Card</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Diners Club Titanium • 3643 XXXXXX 3598</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddPayment(!addPayment)}>
          <PlusCircle size={15} /> Log Payment
        </button>
      </div>

      {/* Add Payment Form */}
      {addPayment && (
        <div className="card" style={{ border: '1px solid rgba(200,169,110,0.3)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 14 }}>Log a Payment</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Date</label>
              <input type="date" value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Amount (QAR)</label>
              <input type="number" placeholder="0.00" value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Note</label>
              <input type="text" placeholder="e.g. Manual payment" value={newPayment.note} onChange={e => setNewPayment({ ...newPayment, note: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={handleAddPayment}>Save Payment</button>
            <button className="btn btn-ghost" onClick={() => setAddPayment(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Balance Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Outstanding Balance', value: fmt(creditCard.balance), color: 'var(--red)' },
          { label: 'Credit Limit', value: fmt(creditCard.limit), color: 'var(--text)' },
          { label: 'Available to Spend', value: fmt(creditCard.limit - creditCard.balance), color: creditCard.limit - creditCard.balance < 1000 ? 'var(--red)' : 'var(--green)' },
          { label: 'Usage', value: `${usagePercent.toFixed(1)}%`, color: usagePercent > 90 ? 'var(--red)' : 'var(--yellow)' },
          { label: 'Monthly Interest', value: fmt(creditCard.balance * creditCard.monthlyInterestRate), color: 'var(--red)' },
          { label: 'Total Fees (This Cycle)', value: fmt(totalFeesPaid), color: 'var(--red)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Usage Bar */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 600 }}>Card Usage</span>
          <span style={{ color: usagePercent > 90 ? 'var(--red)' : 'var(--accent)', fontWeight: 600 }}>{usagePercent.toFixed(1)}%</span>
        </div>
        <div className="progress-bar" style={{ height: 14, borderRadius: 8 }}>
          <div className="progress-fill" style={{
            width: `${Math.min(usagePercent, 100)}%`,
            background: usagePercent > 90 ? 'linear-gradient(90deg, var(--yellow), var(--red))' : 'linear-gradient(90deg, var(--green), var(--accent))',
            borderRadius: 8,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
          <span>QAR 0</span>
          <span style={{ color: 'var(--yellow)' }}>⚠️ 70% = QAR 10,500 (healthy limit)</span>
          <span>QAR 15,000</span>
        </div>
        {usagePercent > 90 && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, fontSize: 13, color: 'var(--red)' }}>
            ⚠️ You're at {usagePercent.toFixed(1)}% usage. Avoid spending until you pay down the balance below QAR 10,500.
          </div>
        )}
      </div>

      {/* Payoff Simulator */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Calculator size={18} color="var(--accent)" />
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Payoff Simulator</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>
              Monthly payment: <strong style={{ color: 'var(--accent)' }}>QAR {payExtra.toLocaleString()}</strong>
            </label>
            <input
              type="range" min={500} max={5000} step={100} value={payExtra}
              onChange={e => setPayExtra(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
              <span>QAR 500</span><span>QAR 5,000</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--bg3)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Debt-free in</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: monthsToPayoff === Infinity ? 'var(--red)' : 'var(--accent)' }}>
              {monthsToPayoff === Infinity ? '∞' : monthsToPayoff}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>months</div>
          </div>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={payoffData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `QAR ${v.toLocaleString()}`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="balance" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
          {[
            { label: 'Min payment (QAR 1,180)', months: calculatePayoff(creditCard.balance, 1180, monthlyFees) },
            { label: 'Recommended (QAR 2,500)', months: calculatePayoff(creditCard.balance, 2500, monthlyFees) },
            { label: 'Aggressive (QAR 3,500)', months: calculatePayoff(creditCard.balance, 3500, monthlyFees) },
          ].map((s, i) => (
            <div key={i} style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontWeight: 700, color: s.months === Infinity ? 'var(--red)' : i === 0 ? 'var(--yellow)' : i === 1 ? 'var(--accent)' : 'var(--green)' }}>
                {s.months === Infinity ? 'Never clears' : `${s.months} months`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <AlertCircle size={18} color="var(--red)" />
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Fee History</h3>
          <span className="badge badge-red" style={{ marginLeft: 'auto' }}>Total: {fmt(totalFeesPaid)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {creditCard.fees.map((fee, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: i < creditCard.fees.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{fee.type}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{fee.date}</div>
              </div>
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>+{fmt(fee.amount)}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(248,113,113,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--text2)' }}>
          💡 Cancel Credit Shield Insurance to save <strong style={{ color: 'var(--accent)' }}>QAR 1,188/year</strong> in unnecessary fees.
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Payment History</h3>
        {creditCard.payments.map((p, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: i < creditCard.payments.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.note}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{p.date}</div>
            </div>
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>-{fmt(p.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
