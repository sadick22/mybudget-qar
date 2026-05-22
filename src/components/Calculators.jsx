import React, { useState } from 'react'
import { Calculator, PiggyBank, CreditCard, Percent } from 'lucide-react'
import { fmt } from '../data.js'

export default function Calculators({ data }) {
  const salary = data.profile.salary

  // Payoff calc
  const [balance, setBalance] = useState(data.creditCard.balance)
  const [monthlyPay, setMonthlyPay] = useState(2500)
  const [rate, setRate] = useState(1.05)

  // Savings calc
  const [saveMonthly, setSaveMonthly] = useState(1500)
  const [saveGoal, setSaveGoal] = useState(27000)

  // 50/30/20
  const [splitSalary, setSplitSalary] = useState(salary)

  function calcPayoff(b, monthly, monthlyRate) {
    const r = monthlyRate / 100
    if (monthly <= b * r) return { months: Infinity, totalPaid: Infinity, interest: Infinity }
    const months = Math.ceil(-Math.log(1 - (b * r) / monthly) / Math.log(1 + r))
    const totalPaid = monthly * months
    return { months, totalPaid, interest: totalPaid - b }
  }

  const payoffResult = calcPayoff(balance, monthlyPay, rate)
  const saveMonths = Math.ceil(saveGoal / saveMonthly)
  const saveYears = (saveMonths / 12).toFixed(1)

  const needs = splitSalary * 0.5
  const wants = splitSalary * 0.3
  const savings = splitSalary * 0.2

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Calculators</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Financial tools to plan your future</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>

        {/* Credit Card Payoff */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(248,113,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color="var(--red)" />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: 16 }}>Credit Card Payoff</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SliderField label="Current Balance" value={balance} min={0} max={20000} step={100} onChange={setBalance} prefix="QAR " color="var(--red)" />
            <SliderField label="Monthly Payment" value={monthlyPay} min={500} max={6000} step={100} onChange={setMonthlyPay} prefix="QAR " color="var(--accent)" />
            <SliderField label="Monthly Interest Rate" value={rate} min={0.5} max={3} step={0.05} onChange={setRate} suffix="%" color="var(--yellow)" />
          </div>
          <div style={{ marginTop: 18, padding: 16, background: 'var(--bg3)', borderRadius: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
            <ResultBlock label="Months" value={payoffResult.months === Infinity ? '∞' : payoffResult.months} color="var(--accent)" />
            <ResultBlock label="Total Paid" value={payoffResult.totalPaid === Infinity ? '∞' : `QAR ${payoffResult.totalPaid.toFixed(0)}`} color="var(--text)" />
            <ResultBlock label="Interest Cost" value={payoffResult.interest === Infinity ? '∞' : `QAR ${payoffResult.interest.toFixed(0)}`} color="var(--red)" />
          </div>
          {payoffResult.months !== Infinity && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', textAlign: 'center' }}>
              Debt-free by approximately <strong style={{ color: 'var(--green)' }}>{getDebtFreeDate(payoffResult.months)}</strong>
            </div>
          )}
        </div>

        {/* Savings Calculator */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiggyBank size={18} color="var(--green)" />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: 16 }}>Savings Goal Calculator</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SliderField label="Monthly Savings" value={saveMonthly} min={100} max={5000} step={100} onChange={setSaveMonthly} prefix="QAR " color="var(--green)" />
            <SliderField label="Savings Goal" value={saveGoal} min={1000} max={100000} step={1000} onChange={setSaveGoal} prefix="QAR " color="var(--blue)" />
          </div>
          <div style={{ marginTop: 18, padding: 16, background: 'var(--bg3)', borderRadius: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'center' }}>
            <ResultBlock label="Months Needed" value={saveMonths} color="var(--accent)" />
            <ResultBlock label="Years Needed" value={saveYears} color="var(--blue)" />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', textAlign: 'center' }}>
            Goal reached by approximately <strong style={{ color: 'var(--green)' }}>{getDebtFreeDate(saveMonths)}</strong>
          </div>
        </div>

        {/* Interest Cost Calculator */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={18} color="var(--yellow)" />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: 16 }}>Annual Interest Cost</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>How much the bank earns from you annually at your current balance</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Current Balance', value: fmt(data.creditCard.balance) },
              { label: 'Monthly Interest (1.05%)', value: fmt(data.creditCard.balance * 0.0105) },
              { label: 'Annual Interest Cost', value: fmt(data.creditCard.balance * 0.0105 * 12), highlight: true },
              { label: 'Credit Shield (Annual)', value: fmt(99.48 * 12), highlight: true },
              { label: 'Total Annual Cost to Bank', value: fmt(data.creditCard.balance * 0.0105 * 12 + 99.48 * 12), highlight: true, color: 'var(--red)' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: s.highlight ? 'rgba(248,113,113,0.08)' : 'var(--bg3)', borderRadius: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>{s.label}</span>
                <span style={{ fontWeight: 600, color: s.color || (s.highlight ? 'var(--red)' : 'var(--text)') }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 50/30/20 Rule */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,169,110,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={18} color="var(--accent)" />
            </div>
            <h3 style={{ fontWeight: 600, fontSize: 16 }}>50/30/20 Budget Rule</h3>
          </div>
          <SliderField label="Monthly Salary" value={splitSalary} min={3000} max={30000} step={500} onChange={setSplitSalary} prefix="QAR " color="var(--accent)" />
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: '50% — Needs', sub: 'Rent, food, transport, utilities', value: needs, color: 'var(--blue)', pct: 50 },
              { label: '30% — Wants', sub: 'Entertainment, dining out, shopping', value: wants, color: 'var(--purple)', pct: 30 },
              { label: '20% — Savings & Debt', sub: 'Emergency fund, investments, debt payoff', value: savings, color: 'var(--green)', pct: 20 },
            ].map((s, i) => (
              <div key={i} style={{ padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: s.color }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.sub}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: s.color }}>{fmt(s.value)}</div>
                </div>
                <div className="progress-bar" style={{ height: 5 }}>
                  <div className="progress-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(200,169,110,0.08)', borderRadius: 8, fontSize: 12, color: 'var(--text2)' }}>
            💡 Your rent alone (QAR 3,500) is {((3500/splitSalary)*100).toFixed(0)}% of salary — aim to keep total needs under 50%.
          </div>
        </div>

      </div>
    </div>
  )
}

function SliderField({ label, value, min, max, step, onChange, prefix = '', suffix = '', color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</label>
        <strong style={{ color, fontSize: 13 }}>{prefix}{Number(value).toLocaleString()}{suffix}</strong>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color }} />
    </div>
  )
}

function ResultBlock({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color }}>{value}</div>
    </div>
  )
}

function getDebtFreeDate(months) {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return d.toLocaleDateString('en', { month: 'long', year: 'numeric' })
}
