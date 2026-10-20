import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import SalesModule from './components/SalesModule'
import SuppliesModule from './components/SuppliesModule'
import Toast from './components/Toast'
import { checkConnection } from './lib/api'

export default function App() {
  // ─── Dark mode ───────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  // ─── Connection status ───────────────────────────────────────────────────────
  const [connectionStatus, setConnectionStatus] = useState('checking')

  useEffect(() => {
    checkConnection().then(setConnectionStatus).catch(() => setConnectionStatus('error'))
  }, [])

  // ─── Toast system ────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        connectionStatus={connectionStatus}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Demo mode banner */}
        {connectionStatus === 'mock' && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 animate-fade-in">
            <span className="text-amber-500 mt-0.5 shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Demo rejim — Supabase ulangan emas
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                Ilova to'liq ishlaydi. Real ma'lumotlar uchun{' '}
                <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">
                  .env
                </code>{' '}
                faylida{' '}
                <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">
                  VITE_SUPABASE_URL
                </code>{' '}
                va{' '}
                <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded font-mono">
                  VITE_SUPABASE_ANON_KEY
                </code>{' '}
                ni kiriting.
              </p>
            </div>
          </div>
        )}

        {/* Two-column layout for tablet, stacked for mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Module 1 — Kunlik Savdo */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-6 rounded-full bg-orange-400" />
              <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                Kunlik Savdo
              </h2>
            </div>
            <SalesModule onToast={pushToast} />
          </div>

          {/* Module 2 — Kerakli Mahsulotlar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-6 rounded-full bg-violet-400" />
              <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                Kerakli Mahsulotlar
              </h2>
            </div>
            <SuppliesModule onToast={pushToast} />
          </div>
        </div>
      </main>

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
