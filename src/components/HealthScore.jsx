import React, { useMemo } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Shield, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info } from 'lucide-react'

function calcScore(data) {
  const { profile, creditCard, transactions, goals } = data
  const salary = profile.salary
  const currentMonth = new Date().toISOString().slice(0, 7)

  // 1. Debt-to-Income (0-25 pts): lower is better
  const dti = (creditCard.balance / salary) * 100
  const dtiScore = dti > 200 ? 0 : dti > 150 ? 5 : dti > 100 ? 10 : dti > 50 ? 18 : 25

  // 2. Card Usage (0-20 pts): under 30% = full marks
  const usage = (creditCard.balance / creditCard.limit) * 100
  const usageScore = usage > 100 ? 0 : usage > 90 ? 4 : usage > 70 ? 8 : usage > 50 ? 13 : usage > 30 ? 17 : 20

  // 3. Savings Rate (0-20 pts)
  const monthlySaving = data.savings?.monthlySaving || 0
  const savingsRate = (monthlySaving / salary) * 100
  const savingsScore = savingsRate >= 20 ? 20 : savingsRate >= 10 ? 15 : savingsRate >= 5 ? 10 : savingsRate > 0 ? 5 : 0

  // 4. Payment History (0-20 pts): late fees = penalty
  const lateFees = creditCard.fees.filter(f => f.type.toLowerCase().includes('late')).length
  const paymentScore = lateFees === 0 ? 20 : lateFees === 1 ? 12 : lateFees === 2 ? 6 : 0

  // 5. Budget Adherence (0-15 pts)
  const totalBudgeted = data.budget.categories.reduce((s, c) => s + c.budgeted, 0)
  const totalSpent = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const adherence = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 100
  const budgetScore = adherence <= 80 ? 15 : adherence <= 100 ? 12 : adherence <= 110 ? 7 : 2

  // 6. Emergency Fund (0-10 pts)
  const efGoal = goals.find(g => g.name.toLowerCase().includes('emergency'))
  const efPct = efGoal ? (efGoal.current / efGoal.target) * 100 : 0
  const efScore = efPct >= 100 ? 10 : efPct >= 50 ? 7 : efPct >= 25 ? 4 : efPct > 0 ? 2 : 0

  // 7. Overlimit penalty
  const overlimitFees = creditCard.fees.filter(f => f.type.toLowerCase().includes('overlimit')).length
  const overlimitPenalty = overlimitFees * 5

  const total = Math.max(0, Math.min(100, dtiScore + usageScore + savingsScore + paymentScore + budgetScore + efScore - overlimitPenalty))

  return {
    total: Math.round(total),
    breakdown: [
      { category: 'Debt Ratio', score: dtiScore, max: 25, value: `${dti.toFixed(0)}% DTI` },
      { category: 'Card Usage', score: usageScore, max: 20, value: `${usage.toFixed(0)}% used` },
      { category: 'Savings Rate', score: savingsScore, max: 20, value: `${savingsRate.toFixed(0)}% saved` },
      { category: 'Payments', score: paymentScore, max: 20, value: `${lateFees} late fee(s)` },
      { category: 'Budget', score: budgetScore, max: 15, value: `${adherence.toFixed(0)}% of budget` },
      { category: 'Emergency Fund', score: efScore, max: 10, value: `${efPct.toFixed(0)}% funded` },
    ],
    radarData: [
      { subject: 'Debt', A: (dtiScore / 25) * 100, fullMark: 100 },
      { subject: 'Card Usage', A: (usageScore / 20) * 100, fullMark: 100 },
      { subject: 'Savings', A: (savingsScore / 20) * 100, fullMark: 100 },
      { subject: 'Payments', A: (paymentScore / 20) * 100, fullMark: 100 },
      { subject: 'Budget', A: (budgetScore / 15) * 100, fullMark: 100 },
      { subject: 'Emergency', A: (efScore / 10) * 100, fullMark: 100 },
    ],
  }
}

function getGrade(score) {
  if (score >= 85) return { grade: 'A', label: 'Excellent', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
  if (score >= 70) return { grade: 'B', label: 'Good', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' }
  if (score >= 55) return { grade: 'C', label: 'Fair', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' }
  if (score >= 40) return { grade: 'D', label: 'Needs Work', color: '#fb923c', bg: 'rgba(251,146,60,0.1)' }
  return { grade: 'F', label: 'Critical', color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
}

function getTips(breakdown, data) {
  const tips = []
  const usage = (data.creditCard.balance / data.creditCard.limit) * 100
  const monthlySaving = data.savings?.monthlySaving || 0

  if (usage > 70) tips.push({ icon: '💳', tip: 'Reduce card balance below QAR 10,500 (70% of limit) to improve your score significantly', impact: 'High' })
  if (monthlySaving < 900) tips.push({ icon: '💰', tip: 'Increase monthly savings to at least 10% of salary (QAR 900) for a better savings score', impact: 'High' })
  if (breakdown.find(b => b.category === 'Payments')?.score < 20) tips.push({ icon: '📅', tip: 'Set up auto-payment to never miss a due date again — late fees hurt your score by 8 points', impact: 'High' })
  if (breakdown.find(b => b.category === 'Emergency Fund')?.score < 10) tips.push({ icon: '🛡️', tip: 'Start building your emergency fund — even QAR 500/month makes a measurable difference', impact: 'Medium' })
  if (breakdown.find(b => b.category === 'Budget')?.score < 12) tips.push({ icon: '📊', tip: 'Try to stay under 90% of your monthly budget to earn full budget adherence points', impact: 'Medium' })
  if (data.creditCard.fees.some(f => f.type.toLowerCase().includes('overlimit'))) tips.push({ icon: '⚠️', tip: 'Overlimit fees subtract 5 points each — keep your balance below QAR 15,000 at all times', impact: 'Critical' })

  return tips.slice(0, 4)
}

export default function HealthScore({ data }) {
  const result = useMemo(() => calcScore(data), [data])
  const grade = getGrade(result.total)
  const tips = getTips(result.breakdown, data)

  const circumference = 2 * Math.PI * 54
  const offset = circumference - (result.total / 100) * circumference

  const history = [
    { month: 'Feb', score: 28 },
    { month: 'Mar', score: 32 },
    { month: 'Apr', score: result.total - 5 },
    { month: 'May', score: result.total },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Financial Health Score</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Your personal financial fitness — updated monthly</p>
      </div>

      {/* Main Score Card */}
      <div className="card" style={{ background: `linear-gradient(135deg, ${grade.bg}, var(--bg2))`, border: `1px solid ${grade.color}30` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>

          {/* Circular Progress */}
          <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r="54" fill="none" stroke="var(--bg3)" strokeWidth="12" />
              <circle cx="70" cy="70" r="54" fill="none" stroke={grade.color} strokeWidth="12"
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: grade.color, lineHeight: 1 }}>{result.total}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>out of 100</div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: grade.color, lineHeight: 1 }}>{grade.grade}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, color: grade.color }}>{grade.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Financial Health Grade</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
              {getScoreMessage(result.total, data)}
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              {history.map((h, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 32, height: Math.max(8, (h.score / 100) * 60),
                    background: i === history.length - 1 ? grade.color : 'var(--border)',
                    borderRadius: '4px 4px 0 0', marginBottom: 4,
                    transition: 'height 0.5s ease',
                  }} />
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{h.month}</div>
                  <div style={{ fontSize: 10, color: i === history.length - 1 ? grade.color : 'var(--text3)', fontWeight: i === history.length - 1 ? 700 : 400 }}>{h.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div style={{ width: 200, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={result.radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text3)' }} />
                <Radar name="Score" dataKey="A" stroke={grade.color} fill={grade.color} fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Score Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {result.breakdown.map((item, i) => {
            const pct = (item.score / item.max) * 100
            const itemColor = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)'
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.category}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'var(--bg3)', padding: '2px 8px', borderRadius: 10 }}>{item.value}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: itemColor }}>{item.score}/{item.max}</span>
                </div>
                <div className="progress-bar" style={{ height: 7 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: itemColor }} />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10, fontSize: 12, color: 'var(--text2)', display: 'flex', gap: 8 }}>
          <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} color="var(--accent)" />
          Score is calculated from debt ratio, card usage, savings rate, payment history, budget adherence, and emergency fund status.
        </div>
      </div>

      {/* What to Improve */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>🎯 How to Improve Your Score</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tips.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{t.tip}</span>
              </div>
              <span className={`badge ${t.impact === 'Critical' ? 'badge-red' : t.impact === 'High' ? 'badge-yellow' : 'badge-blue'}`} style={{ flexShrink: 0 }}>
                {t.impact}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Score Scale */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Score Scale</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {[
            { range: '85-100', grade: 'A', label: 'Excellent', color: '#4ade80' },
            { range: '70-84', grade: 'B', label: 'Good', color: '#60a5fa' },
            { range: '55-69', grade: 'C', label: 'Fair', color: '#fbbf24' },
            { range: '40-54', grade: 'D', label: 'Needs Work', color: '#fb923c' },
            { range: '0-39', grade: 'F', label: 'Critical', color: '#f87171' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '10px 12px', background: result.total >= parseInt(s.range) ? `${s.color}15` : 'var(--bg3)', borderRadius: 10, textAlign: 'center', border: `1px solid ${result.total >= parseInt(s.range) ? s.color + '40' : 'transparent'}` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: s.color }}>{s.grade}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{s.range}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function getScoreMessage(score, data) {
  const usage = (data.creditCard.balance / data.creditCard.limit) * 100
  if (score < 40) return `Your finances need urgent attention. The overlimit fees and late payments are costing you money every month. Focus on getting the card balance below QAR 15,000 first.`
  if (score < 55) return `You're building awareness of your finances which is the first step. The biggest wins right now are: paying on time every month and reducing your card balance.`
  if (score < 70) return `You're making progress! Your score will jump significantly once your card balance drops below QAR 10,500 (70% usage) and your savings rate increases.`
  if (score < 85) return `Good financial habits are forming. Keep paying more than the minimum on your card and increasing your monthly savings as your debt shrinks.`
  return `Excellent financial health! You're managing debt responsibly and building savings consistently. Keep it up!`
}
