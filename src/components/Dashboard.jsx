import React, { useMemo } from 'react'
import { TrendingDown, TrendingUp, CreditCard, Target, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { fmt, getDaysUntil } from '../data.js'

export default function Dashboard({ data }) {
  const { profile, creditCard, budget, transactions, goals } = data

  const currentMonth = new Date().toISOString().slice(0, 7)

  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }, [transactions, currentMonth])

  const monthlyIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions, currentMonth])

  const netPosition = monthlyIncome - monthlyExpenses
  const usagePercent = (creditCard.balance / creditCard.limit) * 100
  const daysUntilDue = getDaysUntil(creditCard.dueDate)
  const availableToSpend = creditCard.limit - creditCard.balance

  const pieData = budget.categories.map(cat => {
    const spent = transactions
      .filter(t => t.category === cat.name && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    return { name: cat.name, value: spent || cat.budgeted * 0.1, color: cat.color }
  }).filter(d => d.value > 0)

  const alerts = []
  if (usagePercent > 90) alerts.push({ type: 'danger', msg: 'Credit card balance is above 90% of limit' })
  if (daysUntilDue <= 5 && daysUntilDue >= 0) alerts.push({ type: 'warning', msg: `Payment due in ${daysUntilDue} days — QAR ${creditCard.balance.toFixed(2)}` })
  if (netPosition < 0) alerts.push({ type: 'danger', msg: 'Spending exceeds income this month' })

  const debtGoal = goals.find(g => g.name.includes('Credit Card'))
  const debtProgress = debtGoal ? (debtGoal.current / debtGoal.target) * 100 : 0

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text)', lineHeight: 1.1 }}>
            Good {getGreeting()}, {profile.name} 👋
          </h1>
          <p style={{ color: 'var(--text2)', marginTop: 4 }}>{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {alerts.length === 0 && (
          <span className="badge badge-green"><CheckCircle size={12} style={{ marginRight: 4 }} /> All good</span>
        )}
      </div>

      {/* Alerts */}
      {alerts.map((alert, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          borderRadius: 10, border: `1px solid ${alert.type === 'danger' ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)'}`,
          background: alert.type === 'danger' ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)',
          color: alert.type === 'danger' ? 'var(--red)' : 'var(--yellow)',
        }}>
          <AlertTriangle size={16} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{alert.msg}</span>
        </div>
      ))}

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Monthly Salary" value={fmt(profile.salary)} icon={<TrendingUp size={18} />} color="var(--green)" sub="Received start of month" />
        <StatCard label="Spent This Month" value={fmt(monthlyExpenses)} icon={<TrendingDown size={18} />} color="var(--red)" sub={`of ${fmt(profile.salary)} budget`} />
        <StatCard label="Net Position" value={fmt(netPosition)} icon={netPosition >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />} color={netPosition >= 0 ? 'var(--green)' : 'var(--red)'} sub={netPosition >= 0 ? 'Surplus this month' : 'Deficit this month'} />
        <StatCard label="Card Due In" value={daysUntilDue <= 0 ? 'Overdue!' : `${daysUntilDue} days`} icon={<Clock size={18} />} color={daysUntilDue <= 5 ? 'var(--red)' : 'var(--yellow)'} sub={new Date(creditCard.dueDate).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })} />
      </div>

      {/* Credit Card Widget */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1e2333 0%, #2a1f3d 100%)', border: '1px solid rgba(200,169,110,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CreditCard size={18} color="var(--accent)" />
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Diners Club Titanium</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--text)' }}>{fmt(creditCard.balance)}</div>
            <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>outstanding balance</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 4 }}>Available to spend</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: availableToSpend < 1000 ? 'var(--red)' : 'var(--green)' }}>{fmt(availableToSpend)}</div>
            <div style={{ color: 'var(--text2)', fontSize: 12 }}>of {fmt(creditCard.limit)} limit</div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Card usage</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: usagePercent > 90 ? 'var(--red)' : 'var(--accent)' }}>{usagePercent.toFixed(1)}%</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{
              width: `${Math.min(usagePercent, 100)}%`,
              background: usagePercent > 90 ? 'var(--red)' : usagePercent > 70 ? 'var(--yellow)' : 'var(--accent)',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>QAR 0</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>QAR 15,000</span>
          </div>
        </div>
        {availableToSpend < 1000 && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>
            ⚠️ Only {fmt(availableToSpend)} available — avoid spending to prevent overlimit fees
          </div>
        )}
      </div>

      {/* Budget + Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Budget Categories */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>Budget This Month</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {budget.categories.map(cat => {
              const spent = transactions
                .filter(t => t.category === cat.name && t.date.startsWith(currentMonth))
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
              const pct = Math.min((spent / cat.budgeted) * 100, 100)
              return (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{cat.icon} {cat.name}</span>
                    <span style={{ fontSize: 12, color: pct > 90 ? 'var(--red)' : 'var(--text2)' }}>
                      {fmt(spent)} / {fmt(cat.budgeted)}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 5 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 90 ? 'var(--red)' : cat.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>Spending Breakdown</h3>
          <div style={{ flex: 1, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `QAR ${v.toFixed(2)}`} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pieData.slice(0, 4).map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ color: 'var(--text2)', flex: 1 }}>{d.name}</span>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>QAR {d.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals preview */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>Financial Goals</h3>
          <Target size={18} color="var(--accent)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map(goal => {
            const pct = Math.min((goal.current / goal.target) * 100, 100)
            return (
              <div key={goal.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{goal.icon} {goal.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{pct.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: goal.color }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{fmt(goal.current)} saved</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>Target: {fmt(goal.target)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{sub}</div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
