import React, { useState, useEffect } from 'react'
import { LayoutDashboard, CreditCard, Wallet, BarChart3, Target, Calculator, Settings, Menu, X, Bell, PiggyBank } from 'lucide-react'
import Dashboard from './components/Dashboard.jsx'
import CreditCardTracker from './components/CreditCardTracker.jsx'
import BudgetPlanner from './components/BudgetPlanner.jsx'
import Transactions from './components/Transactions.jsx'
import Analytics from './components/Analytics.jsx'
import Goals from './components/Goals.jsx'
import Calculators from './components/Calculators.jsx'
import SettingsPage from './components/Settings.jsx'
import Savings from './components/Savings.jsx'
import { loadData, saveData, getDaysUntil } from './data.js'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'credit', label: 'Credit Card', icon: CreditCard },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: Wallet },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'calculators', label: 'Calculators', icon: Calculator },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'savings', label: 'Savings', icon: PiggyBank },
]

const BOTTOM_NAV = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'credit', label: 'Card', icon: CreditCard },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'goals', label: 'Goals', icon: Target },
]

export default function App() {
  const [data, setDataRaw] = useState(() => loadData())
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.profile.theme || 'dark')
  }, [data.profile.theme])

  function setData(newData) {
    setDataRaw(newData)
    saveData(newData)
  }

  const daysUntilDue = getDaysUntil(data.creditCard.dueDate)
  const hasAlert = daysUntilDue <= 5 && daysUntilDue >= 0

  function renderPage() {
    const props = { data, setData }
    switch (page) {
      case 'dashboard': return <Dashboard {...props} />
      case 'credit': return <CreditCardTracker {...props} />
      case 'budget': return <BudgetPlanner {...props} />
      case 'transactions': return <Transactions {...props} />
      case 'analytics': return <Analytics {...props} />
      case 'goals': return <Goals {...props} />
      case 'calculators': return <Calculators {...props} />
      case 'settings': return <SettingsPage {...props} />
      case 'savings': return <Savings {...props} />
      default: return <Dashboard {...props} />
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0,
        zIndex: 50, transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s',
      }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent)' }}>MyBudget</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>QAR · Doha, Qatar 🇶🇦</div>
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(200,169,110,0.1)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Salary</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>QAR {data.profile.salary.toLocaleString()}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map(item => {
            const Icon = item.icon
            const active = page === item.id
            return (
              <button key={item.id} onClick={() => { setPage(item.id); setSidebarOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                  background: active ? 'rgba(200,169,110,0.15)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text2)',
                  fontWeight: active ? 600 : 400, fontSize: 14, transition: 'all 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text2)' } }}
              >
                <Icon size={16} />
                {item.label}
                {item.id === 'credit' && hasAlert && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', position: 'absolute', right: 12, top: 12 }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)' }}>
          Built with ❤️ for Sadick
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="main-content">

        {/* Top bar */}
        <header style={{
          padding: '16px 28px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hamburger" style={{ background: 'none', color: 'var(--text2)', padding: 4, display: 'none' }}>
              <Menu size={22} />
            </button>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{NAV.find(n => n.id === page)?.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {hasAlert && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8, fontSize: 12, color: 'var(--red)' }}>
                <Bell size={13} />
                Payment due in {daysUntilDue} days
              </div>
            )}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#0f1117' }}>
              {data.profile.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page */}
        <div style={{ flex: 1, padding: '28px', maxWidth: 1200, width: '100%', margin: '0 auto', paddingBottom: 90 }}>
          {renderPage()}
        </div>
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        display: 'none', alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 0 12px', zIndex: 30,
      }}>
        {BOTTOM_NAV.map(item => {
          const Icon = item.icon
          const active = page === item.id
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', color: active ? 'var(--accent)' : 'var(--text3)',
              padding: '4px 16px', fontSize: 10, fontWeight: active ? 600 : 400,
            }}>
              <Icon size={20} />
              {item.label}
            </button>
          )
        })}
        <button onClick={() => setSidebarOpen(true)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          background: 'none', color: 'var(--text3)', padding: '4px 16px', fontSize: 10,
        }}>
          <Menu size={20} />
          More
        </button>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0 !important; }
          .hamburger { display: flex !important; }
          .bottom-nav { display: flex !important; }
          main > div { padding: 16px !important; }
        }
      `}</style>
    </div>
  )
}
