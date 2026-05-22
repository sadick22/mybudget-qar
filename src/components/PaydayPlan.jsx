import React, { useState, useEffect } from 'react'
import { CheckCircle, Circle, Clock, Zap, ChevronDown, ChevronUp, Calendar, AlertTriangle } from 'lucide-react'
import { fmt } from '../data.js'

function getNextPayday(payday) {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), payday)
  if (now < thisMonth) return thisMonth
  return new Date(now.getFullYear(), now.getMonth() + 1, payday)
}

function getCountdown(target) {
  const now = new Date()
  const diff = target - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isPast: false,
  }
}

export default function PaydayPlan({ data, setData }) {
  const { profile, creditCard } = data
  const salary = profile.salary
  const monthlySaving = data.savings?.monthlySaving || 500

  const payday24 = getNextPayday(24)
  const payday28 = getNextPayday(28)
  const nextPayday = payday24 < payday28 ? payday24 : payday28
  const paydayDate = payday24 < payday28 ? 24 : 28

  const [countdown, setCountdown] = useState(getCountdown(nextPayday))
  const [checklist, setChecklist] = useState(
    data.paydayChecklist || generateChecklist(salary, monthlySaving, creditCard)
  )
  const [expandedStep, setExpandedStep] = useState(null)
  const [selectedPayday, setSelectedPayday] = useState(paydayDate)

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown(nextPayday)), 1000)
    return () => clearInterval(interval)
  }, [nextPayday])

  function toggleCheck(id) {
    const updated = checklist.map(item => item.id === id ? { ...item, done: !item.done } : item)
    setChecklist(updated)
    setData({ ...data, paydayChecklist: updated })
  }

  function resetChecklist() {
    const fresh = generateChecklist(salary, monthlySaving, creditCard)
    setChecklist(fresh)
    setData({ ...data, paydayChecklist: fresh })
  }

  const completedCount = checklist.filter(c => c.done).length
  const completionPct = (completedCount / checklist.length) * 100
  const totalAllocated = checklist.filter(c => c.amount).reduce((s, c) => s + c.amount, 0)
  const unallocated = salary - totalAllocated
  const urgentItems = checklist.filter(c => c.priority === 'urgent' && !c.done)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Payday Action Plan</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Your step-by-step guide for when salary arrives</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[24, 28].map(d => (
            <button key={d} onClick={() => setSelectedPayday(d)}
              className={selectedPayday === d ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ fontSize: 13, padding: '8px 16px' }}>
              {d}th
            </button>
          ))}
        </div>
      </div>

      {/* Countdown Timer */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(200,169,110,0.12), rgba(96,165,250,0.08))', border: '1px solid rgba(200,169,110,0.25)', textAlign: 'center', padding: '32px 24px' }}>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2 }}>
          {countdown.isPast ? '🎉 Payday is here!' : `Next Payday — ${selectedPayday === 24 ? '24th' : '28th'} May 2026`}
        </div>
        {!countdown.isPast ? (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Min' },
              { value: countdown.seconds, label: 'Sec' },
            ].map((t, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: 'var(--accent)', lineHeight: 1, minWidth: 70 }}>
                  {String(t.value).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{t.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--green)' }}>
            Execute your plan now! 🚀
          </div>
        )}
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text2)' }}>
          Incoming: <strong style={{ color: 'var(--green)', fontSize: 16 }}>{fmt(salary)}</strong>
        </div>
      </div>

      {/* Urgent Alert */}
      {urgentItems.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={16} color="var(--red)" />
          <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>
            {urgentItems.length} urgent action{urgentItems.length > 1 ? 's' : ''} pending — do these first on payday!
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 600 }}>Plan Progress</span>
          <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{completedCount}/{checklist.length} done</span>
        </div>
        <div className="progress-bar" style={{ height: 10, borderRadius: 6 }}>
          <div className="progress-fill" style={{ width: `${completionPct}%`, background: completionPct === 100 ? 'var(--green)' : 'var(--accent)', borderRadius: 6 }} />
        </div>
        {completionPct === 100 && (
          <div style={{ marginTop: 10, textAlign: 'center', color: 'var(--green)', fontSize: 14, fontWeight: 600 }}>
            ✅ All done! Great financial discipline, Sadick!
          </div>
        )}
      </div>

      {/* Salary Allocation */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Salary Allocation</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <div style={{ padding: '12px', background: 'rgba(74,222,128,0.1)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Total Salary</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--green)' }}>{fmt(salary)}</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(248,113,113,0.1)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Allocated</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--red)' }}>{fmt(totalAllocated)}</div>
          </div>
          <div style={{ padding: '12px', background: unallocated >= 0 ? 'rgba(200,169,110,0.1)' : 'rgba(248,113,113,0.1)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Remaining</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: unallocated >= 0 ? 'var(--accent)' : 'var(--red)' }}>{fmt(Math.abs(unallocated))}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, height: 12, background: 'var(--bg3)', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
          {checklist.filter(c => c.amount && c.color).map((item, i) => (
            <div key={i} style={{ width: `${(item.amount / salary) * 100}%`, background: item.color, transition: 'width 0.5s' }} title={`${item.label}: ${fmt(item.amount)}`} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {checklist.filter(c => c.amount && c.color).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Step-by-Step Checklist</h3>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={resetChecklist}>
            Reset
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {checklist.map((item, i) => (
            <div key={item.id}>
              <div
                onClick={() => setExpandedStep(expandedStep === item.id ? null : item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  background: item.done ? 'rgba(74,222,128,0.06)' : 'var(--bg3)',
                  borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                  border: `1px solid ${item.done ? 'rgba(74,222,128,0.2)' : item.priority === 'urgent' ? 'rgba(248,113,113,0.2)' : 'var(--border)'}`,
                }}>
                <button onClick={e => { e.stopPropagation(); toggleCheck(item.id) }}
                  style={{ background: 'none', flexShrink: 0, color: item.done ? 'var(--green)' : 'var(--text3)', transition: 'color 0.2s', border: 'none', cursor: 'pointer' }}>
                  {item.done ? <CheckCircle size={22} /> : <Circle size={22} />}
                </button>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: item.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? 'var(--text3)' : 'var(--text)' }}>
                      Step {i + 1}: {item.label}
                    </span>
                    {item.priority === 'urgent' && !item.done && <span className="badge badge-red" style={{ fontSize: 10 }}>Urgent</span>}
                  </div>
                  {item.amount && (
                    <div style={{ fontSize: 12, color: item.done ? 'var(--text3)' : 'var(--accent)', fontWeight: 600, marginTop: 2 }}>
                      {fmt(item.amount)}
                    </div>
                  )}
                </div>
                <div style={{ color: 'var(--text3)' }}>
                  {expandedStep === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>
              {expandedStep === item.id && (
                <div style={{ padding: '12px 16px', background: 'var(--bg2)', borderRadius: '0 0 12px 12px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, border: '1px solid var(--border)', borderTop: 'none' }}>
                  {item.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="card" style={{ background: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.2)' }}>
        <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: 'var(--accent)' }}>⚡ Payday Golden Rules</h3>
        {[
          'Do steps 1-3 within the first 30 minutes of receiving your salary',
          'Never spend from your salary before saving and paying the card',
          'If your salary is less than expected, adjust discretionary spending — not savings',
          'Screenshot your bank balance after completing all steps as a record',
        ].map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function generateChecklist(salary, monthlySaving, creditCard) {
  return [
    {
      id: 1, done: false, priority: 'urgent', icon: '💰', color: '#4ade80',
      label: 'Transfer savings', amount: monthlySaving,
      detail: `Immediately transfer QAR ${monthlySaving.toLocaleString()} to your savings account or pot. This is non-negotiable — pay yourself first before any other expense. If you use a separate savings account, do this transfer within minutes of receiving your salary.`,
    },
    {
      id: 2, done: false, priority: 'urgent', icon: '💳', color: '#f87171',
      label: 'Pay credit card', amount: 2500,
      detail: `Transfer QAR 2,500 toward your Diners Club card (balance: QAR ${creditCard.balance.toLocaleString()}). This is above the minimum of QAR 1,180 and will help clear your debt faster. If auto-debit is set up, verify it went through and top up the difference manually.`,
    },
    {
      id: 3, done: false, priority: 'urgent', icon: '🏠', color: '#60a5fa',
      label: 'Pay rent', amount: 3500,
      detail: `Transfer QAR 3,500 for your Al Rufaa apartment rent. Confirm receipt with your landlord. Rent should always be the first essential bill paid — late rent can have serious consequences.`,
    },
    {
      id: 4, done: false, priority: 'normal', icon: '🛒', color: '#a78bfa',
      label: 'Set food & transport budget', amount: 900,
      detail: `Set aside QAR 900 mentally or in a separate wallet for food (QAR 600) and transport (QAR 300) for the month. Consider withdrawing cash or using a separate card for these to avoid overspending.`,
    },
    {
      id: 5, done: false, priority: 'normal', icon: '📋', color: '#fbbf24',
      label: 'Pay any outstanding bills',
      detail: `Check for any bills due this month — phone plan, internet, subscriptions. Pay them now while you have the full salary, not at the end of the month when your balance is low.`,
    },
    {
      id: 6, done: false, priority: 'normal', icon: '🛍️', color: '#c8a96e',
      label: 'Allocate personal spending', amount: 600,
      detail: `The remaining QAR 600 is your personal spending budget for the month — clothing, entertainment, dining out, personal care. Track every expense in the Transactions tab to stay within this.`,
    },
    {
      id: 7, done: false, priority: 'normal', icon: '📊', color: '#34d399',
      label: 'Update the app with transactions',
      detail: `Log all the transfers you just made in the Transactions tab of this app. This keeps your dashboard accurate and helps you track your progress toward being debt-free.`,
    },
    {
      id: 8, done: false, priority: 'normal', icon: '📸', color: '#818cf8',
      label: 'Screenshot your bank balance',
      detail: `Take a screenshot of your bank balance after completing all steps. This creates a record and helps you compare month-to-month. You can also note it in your monthly review.`,
    },
  ]
}
