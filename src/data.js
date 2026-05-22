// Default initial data pre-populated with Sadick's real situation
export const defaultData = {
  profile: {
    name: 'Sadick',
    salary: 9000,
    payday: 1, // day of month
    currency: 'QAR',
    theme: 'dark',
  },
  creditCard: {
    balance: 14223.36,
    limit: 15000,
    dueDate: '2026-05-09',
    statementDate: 24,
    monthlyInsurance: 99.48,
    monthlyInterestRate: 0.0105, // ~1.05% per month
    payments: [
      { date: '2026-04-29', amount: 1180.04, note: 'Auto minimum payment' },
      { date: '2026-04-12', amount: 340.00, note: 'bankDirect payment' },
      { date: '2026-04-08', amount: 0.34, note: 'Credit adjustment' },
    ],
    fees: [
      { date: '2026-04-10', type: 'Late Payment Fee', amount: 100.00 },
      { date: '2026-04-24', type: 'Credit Shield Insurance', amount: 99.48 },
      { date: '2026-04-24', type: 'Remaining Balance Service Charge', amount: 167.18 },
      { date: '2026-04-24', type: 'Overlimit Fee', amount: 150.00 },
    ],
  },
  budget: {
    categories: [
      { id: 1, name: 'Rent', budgeted: 3500, color: '#60a5fa', icon: '🏠' },
      { id: 2, name: 'Food & Groceries', budgeted: 600, color: '#4ade80', icon: '🛒' },
      { id: 3, name: 'Transport', budgeted: 300, color: '#fbbf24', icon: '🚗' },
      { id: 4, name: 'Personal & Misc', budgeted: 600, color: '#a78bfa', icon: '🛍️' },
      { id: 5, name: 'Credit Card Payment', budgeted: 2500, color: '#f87171', icon: '💳' },
      { id: 6, name: 'Emergency Buffer', budgeted: 1500, color: '#c8a96e', icon: '🛡️' },
    ],
  },
  transactions: [
    { id: 1, date: '2026-04-29', description: 'Credit Card Payment', amount: -1180.04, category: 'Credit Card Payment', type: 'expense', recurring: true },
    { id: 2, date: '2026-05-01', description: 'Monthly Salary', amount: 9000, category: 'Income', type: 'income', recurring: true },
    { id: 3, date: '2026-05-01', description: 'Rent - Al Rufaa', amount: -3500, category: 'Rent', type: 'expense', recurring: true },
    { id: 4, date: '2026-05-03', description: 'Lulu Hypermarket', amount: -245, category: 'Food & Groceries', type: 'expense', recurring: false },
    { id: 5, date: '2026-05-05', description: 'Karwa Taxi', amount: -85, category: 'Transport', type: 'expense', recurring: false },
  ],
  goals: [
    { id: 1, name: 'Clear Credit Card Debt', target: 14223.36, current: 1180.04, deadline: '2026-12-31', color: '#f87171', icon: '💳' },
    { id: 2, name: 'Emergency Fund (3 months)', target: 27000, current: 0, deadline: '2027-06-30', color: '#4ade80', icon: '🛡️' },
    { id: 3, name: 'Savings Goal', target: 5000, current: 0, deadline: '2026-12-31', color: '#60a5fa', icon: '💰' },
  ],
  monthlyHistory: [
    {
      month: '2026-03',
      income: 9000,
      expenses: { Rent: 3500, 'Food & Groceries': 580, Transport: 310, 'Personal & Misc': 720, 'Credit Card Payment': 340 },
      cardBalance: 15227.08,
      fees: 416.66,
    },
    {
      month: '2026-04',
      income: 9000,
      expenses: { Rent: 3500, 'Food & Groceries': 600, Transport: 300, 'Personal & Misc': 600, 'Credit Card Payment': 1520.38 },
      cardBalance: 14223.36,
      fees: 516.66,
    },
  ],
}

export function loadData() {
  try {
    const raw = localStorage.getItem('mybudget_qar')
    return raw ? JSON.parse(raw) : defaultData
  } catch {
    return defaultData
  }
}

export function saveData(data) {
  localStorage.setItem('mybudget_qar', JSON.stringify(data))
}

export function exportJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mybudget_backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(transactions) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (QAR)']
  const rows = transactions.map(t => [t.date, t.description, t.category, t.type, t.amount])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function fmt(amount, currency = 'QAR') {
  return `${currency} ${Math.abs(amount).toLocaleString('en-QA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function getDaysUntil(dateStr) {
  const today = new Date()
  const target = new Date(dateStr)
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return diff
}

export function getMonthName(monthStr) {
  const [year, month] = monthStr.split('-')
  return new Date(year, month - 1).toLocaleString('en', { month: 'short', year: '2-digit' })
}

export const CATEGORIES = ['Rent', 'Food & Groceries', 'Transport', 'Personal & Misc', 'Credit Card Payment', 'Emergency Buffer', 'Healthcare', 'Entertainment', 'Clothing', 'Education', 'Income', 'Other']
