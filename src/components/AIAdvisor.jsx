import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react'
import { fmt } from '../data.js'

const SUGGESTED_QUESTIONS = [
  "Can I afford to buy a new phone this month?",
  "How long until I clear my credit card debt?",
  "Should I cancel Credit Shield Insurance?",
  "What's my biggest spending problem?",
  "How much will I save in 6 months?",
  "What happens if I pay QAR 3,000 on my card?",
  "Am I on track financially?",
  "How do I improve my financial health score?",
]

function buildContext(data) {
  const { profile, creditCard, budget, transactions, goals, savings } = data
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const monthlySaving = savings?.monthlySaving || 0
  const totalFees = creditCard.fees.reduce((s, f) => s + f.amount, 0)
  const monthlyInterest = creditCard.balance * creditCard.monthlyInterestRate

  return `You are a personal financial advisor for ${profile.name}, a person living in Doha, Qatar. You have access to their complete financial data. Be conversational, specific, empathetic, and give actionable advice. Always use QAR as currency. Be concise but thorough. Never be generic — always reference their actual numbers.

THEIR FINANCIAL PROFILE:
- Monthly salary: QAR ${profile.salary.toLocaleString()} (paid on the 24th or 28th of the month)
- Credit card: Diners Club Titanium + Mastercard add-on
- Card limit: QAR ${creditCard.limit.toLocaleString()}
- Card balance (debt): QAR ${creditCard.balance.toLocaleString()} (${((creditCard.balance / creditCard.limit) * 100).toFixed(1)}% of limit)
- Available to spend on card: QAR ${(creditCard.limit - creditCard.balance).toLocaleString()}
- Card due date: ${creditCard.dueDate}
- Monthly interest charge: ~QAR ${monthlyInterest.toFixed(2)} (1.05% per month)
- Credit Shield Insurance: QAR ${creditCard.monthlyInsurance} per month (optional, can be cancelled)
- Total fees paid this cycle: QAR ${totalFees.toFixed(2)}
- Monthly savings (mandatory): QAR ${monthlySaving.toLocaleString()}
- This month's expenses so far: QAR ${monthlyExpenses.toFixed(2)}
- Monthly budget breakdown: Rent QAR 3,500 | Food QAR 600 | Transport QAR 300 | Personal QAR 600 | Card payment QAR 2,500 | Emergency buffer QAR 1,500

GOALS:
${goals.map(g => `- ${g.name}: QAR ${g.current.toLocaleString()} saved of QAR ${g.target.toLocaleString()} target`).join('\n')}

KEY CONTEXT:
- ${profile.name} is NEW to credit cards and learning good financial habits
- Had an overlimit fee (QAR 150) and late payment fee (QAR 100) last cycle
- Card is currently RESTRICTED due to being over limit (now resolved after payment)
- Previous balance was QAR 15,227 — now reduced to QAR ${creditCard.balance.toLocaleString()} after payments
- Location: Doha, Qatar

Answer their question directly using their real numbers. If they ask about affordability, be honest. If they're making a mistake, tell them kindly but clearly.`
}

export default function AIAdvisor({ data }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${data.profile.name}! 👋 I'm your personal AI financial advisor. I have full access to your financial data — your salary, credit card balance, spending patterns, goals, everything.\n\nAsk me anything: "Can I afford X?", "How do I clear my debt faster?", "What should I do on payday?" — I'll give you specific advice based on YOUR actual numbers, not generic tips.\n\nWhat's on your mind? 💬`,
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userMessage = text || input.trim()
    if (!userMessage || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const systemPrompt = buildContext(data)
      const conversationHistory = messages.map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...conversationHistory, { role: 'user', content: userMessage }],
        }),
      })

      const result = await response.json()
      const reply = result.content?.[0]?.text || "Sorry, I couldn't process that. Please try again."
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please check your internet and try again." }])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: `Hi ${data.profile.name}! 👋 Chat cleared. What would you like to know about your finances?`,
    }])
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, display: 'flex', alignItems: 'center', gap: 10 }}>
            AI Financial Advisor
            <Sparkles size={24} color="var(--accent)" />
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Ask anything — I know your exact financial situation</p>
        </div>
        <button className="btn btn-ghost" onClick={clearChat} style={{ fontSize: 13 }}>
          <RefreshCw size={14} /> Clear Chat
        </button>
      </div>

      {/* Context Banner */}
      <div style={{ padding: '12px 16px', background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>📊 Connected to your data:</span>
        {[
          `Salary: ${fmt(data.profile.salary)}`,
          `Card debt: ${fmt(data.creditCard.balance)}`,
          `Saving: ${fmt(data.savings?.monthlySaving || 0)}/mo`,
          `${data.goals.length} goals`,
          `${data.transactions.length} transactions`,
        ].map((item, i) => (
          <span key={i} style={{ fontSize: 12, padding: '2px 10px', background: 'rgba(200,169,110,0.15)', color: 'var(--accent)', borderRadius: 10, fontWeight: 500 }}>
            {item}
          </span>
        ))}
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>💡 Try asking:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                style={{
                  padding: '8px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)',
                  transition: 'all 0.2s', textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 400 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 480 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'user' ? 'var(--accent)' : 'rgba(200,169,110,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {msg.role === 'user'
                  ? <span style={{ fontWeight: 700, fontSize: 14, color: '#0f1117' }}>{data.profile.name.charAt(0)}</span>
                  : <Bot size={18} color="var(--accent)" />
                }
              </div>
              <div style={{
                maxWidth: '75%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg3)',
                color: msg.role === 'user' ? '#0f1117' : 'var(--text)',
                fontSize: 14, lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(200,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={18} color="var(--accent)" />
              </div>
              <div style={{ padding: '14px 18px', background: 'var(--bg3)', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything about your finances..."
            style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: 'var(--text)' }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 48, height: 48, borderRadius: 12, border: 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              background: loading || !input.trim() ? 'var(--bg3)' : 'var(--accent)',
              color: loading || !input.trim() ? 'var(--text3)' : '#0f1117',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'all 0.2s',
            }}>
            <Send size={18} />
          </button>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
        AI advisor uses your real financial data to give personalised advice. Always verify important decisions with a qualified financial advisor.
      </div>
    </div>
  )
}
