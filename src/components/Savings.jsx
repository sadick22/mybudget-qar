import React, { useState, useMemo } from 'react'
import { PiggyBank, TrendingUp, Plus, Trash2, Lock, Unlock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'
import { fmt } from '../data.js'

const SAVING_PRESETS = [
  { label: 'Conservative', amount: 500, desc: 'Safe while paying off debt', color: 'var(--blue)' },
  { label: 'Balanced', amount: 800, desc: 'Good middle ground', color: 'var(--accent)' },
  { label: 'Aggressive', amount: 1200, desc: 'Once debt is under QAR 10k', color: 'var(--green)' },
]

const SAVING_POTS = [
  { id: 1, name: 'Emergency Fund', target: 27000, current: 0, icon: '🛡️', color: 'var(--blue)', locked: true, desc: '3 months of expenses' },
  { id: 2, name: 'Monthly Buffer', target: 2000, current: 0, icon: '💰', color: 'var(--green)', locked: false, desc: 'For unexpected costs' },
  { id: 3, name: 'Future Goal', target: 10000, current: 0, icon: '🎯', color: 'var(--accent)', locked: false, desc: 'Holiday, car, etc.' },
]

export default function Savings({ data, setData }) {
  const { profile, creditCard } = data
  const salary = profile.salary

  const [monthlySaving, setMonthlySaving] = useState(
    data.savings?.monthlySaving || 500
  )
  const [pots, setPots] = useState(data.savings?.pots || SAVING_POTS)
  const [totalSaved, setTotalSaved] = useState(data.savings?.totalSaved || 0)
  const [showAddPot, setShowAddPot] = useState(false)
  const [selectedPot, setSelectedPot] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [form, setForm] = useState({ name: '', target: '', icon: '💰', color: '#60a5fa', desc: '' })
  const [saved, setSaved] = useState(false)

  const projectionData = useMemo(() => {
    const months = []
    let balance = totalSaved
    let cardBalance = creditCard.balance
    const monthlyFees = creditCard.monthlyInsurance + (cardBalance * creditCard.monthlyInterestRate)

    for (let i = 0; i <= 12; i++) {
      months.push({
        month: `M${i}`,
        Savings: Math.round(balance),
        CardDebt: Math.round(Math.max(0, cardBalance)),
      })
      balance += monthlySaving
      cardBalance = Math.max(0, cardBalance + monthlyFees - 2500)
    }
    return months
  }, [totalSaved, monthlySaving, creditCard])

  const monthsToEmergencyFund = Math.ceil(27000 / monthlySaving)
  const afterSavings = salary - monthlySaving
  const remainingForExpenses = afterSavings - 3500 - 900 - 2500 - 600

  function saveSavingsData(newMonthlySaving, newPots, newTotal) {
    const updated = {
      ...data,
      savings: {
        monthlySaving: newMonthlySaving ?? monthlySaving,
        pots: newPots ?? pots,
        totalSaved: newTotal ?? totalSaved,
      }
    }
    setData(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDeposit(potId) {
    if (!depositAmount || isNaN(depositAmount)) return
    const amount = parseFloat(depositAmount)
    const newPots = pots.map(p => p.id === potId
      ? { ...p, current: Math.min(p.target, p.current + amount) }
      : p
    )
    const newTotal = totalSaved + amount
    setPots(newPots)
    setTotalSaved(newTotal)
    setSelectedPot(null)
    setDepositAmount('')
    saveSavingsData(monthlySaving, newPots, newTotal)
  }

  function deletePot(id) {
    const pot = pots.find(p => p.id === id)
    if (pot?.locked) return
    const newPots = pots.filter(p => p.id !== id)
    setPots(newPots)
    saveSavingsData(monthlySaving, newPots, totalSaved)
  }

  function addPot() {
    if (!form.name || !form.target) return
    const newPot = { ...form, id: Date.now(), current: 0, locked: false, target: parseFloat(form.target) }
    const newPots = [...pots, newPot]
    setPots(newPots)
    setShowAddPot(false)
    setForm({ name: '', target: '', icon: '💰', color: '#60a5fa', desc: '' })
    saveSavingsData(monthlySaving, newPots, totalSaved)
  }

  function handleSetMonthly(amount) {
    setMonthlySaving(amount)
    saveSavingsData(amount, pots, totalSaved)
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Savings</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Mandatory monthly savings — pay yourself first</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddPot(!showAddPot)}>
          <Plus size={15} /> New Savings Pot
        </button>
      </div>

      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(200,169,110,0.15) 0%, rgba(96,165,250,0.1) 100%)',
        border: '1px solid rgba(200,169,110,0.25)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(200,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
          🔒
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
            Mandatory Monthly Saving: <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: 22 }}>QAR {monthlySaving.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            This is transferred automatically on payday before anything else. You don't touch this.
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 2 }}>Remaining after saving</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: remainingForExpenses >= 0 ? 'var(--green)' : 'var(--red)' }}>
            QAR {(salary - monthlySaving).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Set Your Monthly Saving Amount</h3>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18 }}>
          Based on your salary of QAR {salary.toLocaleString()} and current credit card debt of {fmt(creditCard.balance)}, here's what we recommend:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          {SAVING_PRESETS.map(preset => (
            <button key={preset.label} onClick={() => handleSetMonthly(preset.amount)}
              style={{
                padding: '16px', borderRadius: 12, border: `2px solid ${monthlySaving === preset.amount ? preset.color : 'var(--border)'}`,
                background: monthlySaving === preset.amount ? `${preset.color}15` : 'var(--bg3)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: preset.color, marginBottom: 4 }}>
                QAR {preset.amount.toLocaleString()}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{preset.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{preset.desc}</div>
            </button>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Custom amount</span>
            <strong style={{ color: 'var(--accent)' }}>QAR {monthlySaving.toLocaleString()}/month</strong>
          </div>
          <input type="range" min={200} max={3000} step={100} value={monthlySaving}
            onChange={e => handleSetMonthly(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            <span>QAR 200</span><span>QAR 3,000</span>
          </div>
        </div>
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { label: 'Salary', value: fmt(salary), color: 'var(--green)' },
            { label: 'Saved (mandatory)', value: `− ${fmt(monthlySaving)}`, color: 'var(--accent)' },
            { label: 'Remaining', value: fmt(salary - monthlySaving), color: salary - monthlySaving > 7000 ? 'var(--text)' : 'var(--yellow)' },
            { label: 'After all expenses', value: fmt(remainingForExpenses), color: remainingForExpenses >= 0 ? 'var(--green)' : 'var(--red)' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontWeight: 600, color: s.color, fontSize: 15 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Your Savings Pots</h3>

        {showAddPot && (
          <div className="card" style={{ border: '1px solid rgba(200,169,110,0.3)', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 14 }}>New Savings Pot</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Pot Name</label>
                <input type="text" placeholder="e.g. Holiday Fund" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Target Amount (QAR)</label>
                <input type="number" placeholder="5000" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Description</label>
                <input type="text" placeholder="What is this for?" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Icon (emoji)</label>
                <input type="text" placeholder="💰" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Color</label>
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                  style={{ height: 42, cursor: 'pointer', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="btn btn-primary" onClick={addPot}>Create Pot</button>
              <button className="btn btn-ghost" onClick={() => setShowAddPot(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {pots.map(pot => {
            const pct = Math.min((pot.current / pot.target) * 100, 100)
            const remaining = pot.target - pot.current
            const monthsLeft = remaining > 0 ? Math.ceil(remaining / (monthlySaving / pots.length)) : 0

            return (
              <div key={pot.id} className="card" style={{ border: `1px solid ${pot.color}30` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${pot.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                      {pot.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {pot.name}
                        {pot.locked && <Lock size={12} color="var(--text3)" />}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{pot.desc}</div>
                    </div>
                  </div>
                  {!pot.locked && (
                    <button onClick={() => deletePot(pot.id)} style={{ background: 'none', color: 'var(--text3)', padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: pot.color }}>{fmt(pot.current)}</span>
                    <span style={{ fontSize: 13, color: 'var(--text2)', alignSelf: 'flex-end' }}>of {fmt(pot.target)}</span>
                  </div>
                  <div className="progress-bar" style={{ height: 10, borderRadius: 6 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: pot.color, borderRadius: 6 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
                    <span style={{ color: 'var(--text3)' }}>{pct.toFixed(1)}% complete</span>
                    {monthsLeft > 0 && <span style={{ color: 'var(--text3)' }}>~{monthsLeft} months left</span>}
                    {pct >= 100 && <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Complete!</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                  {[25, 50, 75, 100].map(m => (
                    <div key={m} style={{
                      flex: 1, padding: '3px 0', textAlign: 'center', borderRadius: 5, fontSize: 10,
                      background: pct >= m ? `${pot.color}25` : 'var(--bg3)',
                      color: pct >= m ? pot.color : 'var(--text3)',
                      fontWeight: pct >= m ? 600 : 400,
                    }}>{m}%</div>
                  ))}
                </div>

                {selectedPot === pot.id ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" placeholder="Amount to add (QAR)" value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      style={{ flex: 1, fontSize: 13, padding: '8px 12px' }} autoFocus />
                    <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => handleDeposit(pot.id)}>
                      Add
                    </button>
                    <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }} onClick={() => setSelectedPot(null)}>✕</button>
                  </div>
                ) : (
                  <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                    onClick={() => setSelectedPot(pot.id)}>
                    <Plus size={14} /> Add Money
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>12-Month Projection</h3>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          Saving QAR {monthlySaving.toLocaleString()}/month while paying QAR 2,500/month toward your card debt
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--red)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--red)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={v => `QAR ${v.toLocaleString()}`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Area type="monotone" dataKey="Savings" stroke="var(--green)" strokeWidth={2} fill="url(#savingsGrad)" />
            <Area type="monotone" dataKey="CardDebt" stroke="var(--red)" strokeWidth={2} fill="url(#debtGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
            <div style={{ width: 12, height: 3, background: 'var(--green)', borderRadius: 2 }} /> Savings growing
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
            <div style={{ width: 12, height: 3, background: 'var(--red)', borderRadius: 2 }} /> Card debt shrinking
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.06), rgba(96,165,250,0.06))', border: '1px solid rgba(74,222,128,0.15)' }}>
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>💡 Saving Rules to Live By</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: '🔒', tip: 'Pay yourself first — transfer savings the moment your salary arrives, before anything else' },
            { icon: '🚫', tip: "Don't touch your savings for non-emergencies — that's what your monthly buffer is for" },
            { icon: '📈', tip: 'As your credit card debt shrinks, increase your savings by the same amount you save on interest' },
            { icon: '🎯', tip: 'Your first goal: 1 month emergency fund (QAR 9,000). Then 3 months (QAR 27,000)' },
            { icon: '⚡', tip: 'Once the card is cleared, redirect the full QAR 2,500 card payment into savings' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
              <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{t.tip}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
