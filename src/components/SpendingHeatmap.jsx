import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Calendar } from 'lucide-react'
import { fmt } from '../data.js'

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function getColor(amount, max) {
  if (amount === 0) return null
  const intensity = amount / max
  if (intensity < 0.2) return { bg: 'rgba(74,222,128,0.3)', text: '#4ade80', level: 'Low' }
  if (intensity < 0.4) return { bg: 'rgba(74,222,128,0.6)', text: '#22c55e', level: 'Moderate' }
  if (intensity < 0.6) return { bg: 'rgba(251,191,36,0.4)', text: '#fbbf24', level: 'Medium' }
  if (intensity < 0.8) return { bg: 'rgba(251,146,60,0.5)', text: '#fb923c', level: 'High' }
  return { bg: 'rgba(248,113,113,0.6)', text: '#f87171', level: 'Very High' }
}

export default function SpendingHeatmap({ data }) {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  const { transactions } = data

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`

  const dailySpend = useMemo(() => {
    const map = {}
    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
      .forEach(t => {
        const day = parseInt(t.date.split('-')[2])
        map[day] = (map[day] || 0) + Math.abs(t.amount)
      })
    return map
  }, [transactions, monthKey])

  const dailyIncome = useMemo(() => {
    const map = {}
    transactions
      .filter(t => t.type === 'income' && t.date.startsWith(monthKey))
      .forEach(t => {
        const day = parseInt(t.date.split('-')[2])
        map[day] = (map[day] || 0) + t.amount
      })
    return map
  }, [transactions, monthKey])

  const maxSpend = Math.max(...Object.values(dailySpend), 1)
  const totalMonthSpend = Object.values(dailySpend).reduce((s, v) => s + v, 0)
  const totalMonthIncome = Object.values(dailyIncome).reduce((s, v) => s + v, 0)
  const spendDays = Object.keys(dailySpend).length
  const avgDailySpend = spendDays > 0 ? totalMonthSpend / spendDays : 0
  const worstDay = Object.entries(dailySpend).sort((a, b) => b[1] - a[1])[0]

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const today = now.getDate()
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth()

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDay(null)
  }

  const selectedDayTransactions = selectedDay
    ? transactions.filter(t => t.date === `${monthKey}-${String(selectedDay).padStart(2, '0')}`)
    : []

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>Spending Heatmap</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>See your spending patterns day by day</p>
      </div>

      {/* Monthly Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Spent', value: fmt(totalMonthSpend), color: 'var(--red)', icon: <TrendingDown size={15} /> },
          { label: 'Total Income', value: fmt(totalMonthIncome), color: 'var(--green)', icon: <TrendingUp size={15} /> },
          { label: 'Avg Spend Day', value: fmt(avgDailySpend), color: 'var(--yellow)', icon: <Calendar size={15} /> },
          { label: 'Worst Day', value: worstDay ? `${worstDay[0]}th (${fmt(worstDay[1])})` : 'None', color: 'var(--red)', icon: '📍' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: s.color }}>
              {s.icon}
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="card">
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={prevMonth} className="btn btn-ghost" style={{ padding: '8px 12px' }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{monthNames[viewMonth]}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{viewYear}</div>
          </div>
          <button onClick={nextMonth} className="btn btn-ghost" style={{ padding: '8px 12px' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {dayNames.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', padding: '4px 0', fontWeight: 600 }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const spend = dailySpend[day] || 0
            const income = dailyIncome[day] || 0
            const color = spend > 0 ? getColor(spend, maxSpend) : null
            const isToday = isCurrentMonth && day === today
            const isSelected = selectedDay === day
            const hasIncome = income > 0

            return (
              <div key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(200,169,110,0.3)' : color ? color.bg : 'var(--bg3)',
                  border: isToday ? '2px solid var(--accent)' : isSelected ? '2px solid var(--accent)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  position: 'relative',
                  padding: 2,
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.border = '1px solid var(--accent)' }}
                onMouseLeave={e => { if (!isSelected && !isToday) e.currentTarget.style.border = '1px solid transparent' }}
              >
                <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : color ? color.text : 'var(--text3)' }}>
                  {day}
                </div>
                {spend > 0 && (
                  <div style={{ fontSize: 9, color: color?.text, fontWeight: 600, lineHeight: 1 }}>
                    {spend >= 1000 ? `${(spend / 1000).toFixed(1)}k` : Math.round(spend)}
                  </div>
                )}
                {hasIncome && (
                  <div style={{ position: 'absolute', top: 2, right: 2, width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>Spending intensity:</span>
          {[
            { bg: 'rgba(74,222,128,0.3)', label: 'Low' },
            { bg: 'rgba(74,222,128,0.6)', label: 'Moderate' },
            { bg: 'rgba(251,191,36,0.4)', label: 'Medium' },
            { bg: 'rgba(251,146,60,0.5)', label: 'High' },
            { bg: 'rgba(248,113,113,0.6)', label: 'Very High' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: l.bg }} />
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{l.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Income received</span>
          </div>
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="card" style={{ border: '1px solid rgba(200,169,110,0.3)' }}>
          <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>
            {monthNames[viewMonth]} {selectedDay}, {viewYear}
            {dailySpend[selectedDay] && <span style={{ color: 'var(--red)', marginLeft: 12, fontSize: 14 }}>Spent: {fmt(dailySpend[selectedDay])}</span>}
            {dailyIncome[selectedDay] && <span style={{ color: 'var(--green)', marginLeft: 12, fontSize: 14 }}>Received: {fmt(dailyIncome[selectedDay])}</span>}
          </h3>
          {selectedDayTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px 0', fontSize: 13 }}>
              No transactions recorded for this day
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {selectedDayTransactions.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < selectedDayTransactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.category}</div>
                  </div>
                  <span style={{ fontWeight: 600, color: t.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                    {t.type === 'income' ? '+' : '-'}{fmt(Math.abs(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weekly Breakdown */}
      <div className="card">
        <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Weekly Breakdown</h3>
        {(() => {
          const weeks = []
          let weekStart = 1
          while (weekStart <= daysInMonth) {
            const weekEnd = Math.min(weekStart + 6, daysInMonth)
            const weekSpend = Array.from({ length: weekEnd - weekStart + 1 }, (_, i) => dailySpend[weekStart + i] || 0).reduce((s, v) => s + v, 0)
            weeks.push({ start: weekStart, end: weekEnd, spend: weekSpend })
            weekStart += 7
          }
          const maxWeek = Math.max(...weeks.map(w => w.spend), 1)
          return weeks.map((w, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>Week {i + 1} ({w.start}–{w.end} {monthNames[viewMonth].slice(0, 3)})</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: w.spend > 0 ? 'var(--red)' : 'var(--text3)' }}>{w.spend > 0 ? fmt(w.spend) : 'No data'}</span>
              </div>
              <div className="progress-bar" style={{ height: 6 }}>
                <div className="progress-fill" style={{ width: `${(w.spend / maxWeek) * 100}%`, background: (w.spend / maxWeek) > 0.7 ? 'var(--red)' : 'var(--accent)' }} />
              </div>
            </div>
          ))
        })()}
      </div>
    </div>
  )
}
