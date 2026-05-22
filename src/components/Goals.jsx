import React, { useState } from 'react'
import { Target, PlusCircle, Trash2, TrendingUp } from 'lucide-react'
import { fmt } from '../data.js'

export default function Goals({ data, setData }) {
  const { goals } = data
  const [showAdd, setShowAdd] = useState(false)
  const [updateGoalId, setUpdateGoalId] = useState(null)
  const [addAmount, setAddAmount] = useState('')
  const [form, setForm] = useState({ name: '', target: '', current: '0', deadline: '', color: '#60a5fa', icon: '🎯' })

  function addGoal() {
    if (!form.name || !form.target) return
    const g = { ...form, id: Date.now(), target: parseFloat(form.target), current: parseFloat(form.current || 0) }
    setData({ ...data, goals: [...goals, g] })
    setShowAdd(false)
    setForm({ name: '', target: '', current: '0', deadline: '', color: '#60a5fa', icon: '🎯' })
  }

  function deleteGoal(id) {
    setData({ ...data, goals: goals.filter(g => g.id !== id) })
  }

  function updateProgress(id) {
    if (!addAmount) return
    const updated = goals.map(g => g.id === id ? { ...g, current: Math.min(g.target, g.current + parseFloat(addAmount)) } : g)
    setData({ ...data, goals: updated })
    setUpdateGoalId(null)
    setAddAmount('')
  }

  const totalSaved = goals.reduce((s, g) => s + g.current, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target, 0)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Financial Goals</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Track your progress toward financial freedom</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <PlusCircle size={15} /> New Goal
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Total Goals</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{goals.length}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Total Progress</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--green)' }}>{fmt(totalSaved)}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Total Target</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent)' }}>{fmt(totalTarget)}</div>
        </div>
      </div>

      {/* Add Goal Form */}
      {showAdd && (
        <div className="card" style={{ border: '1px solid rgba(200,169,110,0.3)' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 14 }}>New Goal</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Goal Name</label>
              <input type="text" placeholder="e.g. Emergency Fund" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Target Amount (QAR)</label>
              <input type="number" placeholder="0.00" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Current Saved (QAR)</label>
              <input type="number" placeholder="0.00" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Icon</label>
              <input type="text" placeholder="🎯" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Color</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                style={{ height: 42, cursor: 'pointer', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-primary" onClick={addGoal}>Add Goal</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Goal Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {goals.map(goal => {
          const pct = Math.min((goal.current / goal.target) * 100, 100)
          const remaining = goal.target - goal.current
          const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null

          return (
            <div key={goal.id} className="card" style={{ border: `1px solid ${goal.color}30` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${goal.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {goal.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{goal.name}</div>
                    {daysLeft !== null && (
                      <div style={{ fontSize: 12, color: daysLeft < 30 ? 'var(--red)' : 'var(--text3)' }}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue!'}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteGoal(goal.id)} style={{ background: 'none', color: 'var(--text3)', padding: 4, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: goal.color }}>{pct.toFixed(1)}%</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)', alignSelf: 'flex-end' }}>{fmt(goal.current)} / {fmt(goal.target)}</span>
                </div>
                <div className="progress-bar" style={{ height: 10, borderRadius: 6 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: goal.color, borderRadius: 6 }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                  {fmt(remaining)} remaining
                </div>
              </div>

              {/* Milestones */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[25, 50, 75, 100].map(milestone => (
                  <div key={milestone} style={{
                    flex: 1, padding: '4px 0', textAlign: 'center', borderRadius: 6, fontSize: 11,
                    background: pct >= milestone ? `${goal.color}30` : 'var(--bg3)',
                    color: pct >= milestone ? goal.color : 'var(--text3)',
                    fontWeight: pct >= milestone ? 600 : 400,
                  }}>
                    {milestone}%
                  </div>
                ))}
              </div>

              {/* Update Progress */}
              {updateGoalId === goal.id ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" placeholder="Amount to add" value={addAmount} onChange={e => setAddAmount(e.target.value)}
                    style={{ flex: 1, fontSize: 13, padding: '8px 12px' }} />
                  <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => updateProgress(goal.id)}>Add</button>
                  <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }} onClick={() => setUpdateGoalId(null)}>✕</button>
                </div>
              ) : (
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                  onClick={() => setUpdateGoalId(goal.id)}>
                  <TrendingUp size={14} /> Update Progress
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
