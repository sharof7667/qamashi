import { useEffect, useState } from 'react'
import { Sun, Moon, Wifi, WifiOff, Clock } from 'lucide-react'

function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')
  const h = pad(time.getHours())
  const m = pad(time.getMinutes())
  const s = pad(time.getSeconds())

  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']

  const dayName = days[time.getDay()]
  const monthName = months[time.getMonth()]
  const dateStr = `${dayName}, ${time.getDate()} ${monthName} ${time.getFullYear()}`

  return (
    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
      <Clock size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-bold tabular-nums tracking-tight text-slate-800 dark:text-slate-100">
          {h}:{m}:{s}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{dateStr}</span>
      </div>
    </div>
  )
}

function ConnectionBadge({ status }) {
  const configs = {
    connected: {
      icon: <Wifi size={13} />,
      label: 'Ulangan',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    },
    mock: {
      icon: <Wifi size={13} />,
      label: 'Demo rejim',
      cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    },
    error: {
      icon: <WifiOff size={13} />,
      label: 'Ulanmagan',
      cls: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
    checking: {
      icon: <Wifi size={13} className="animate-pulse" />,
      label: 'Tekshirilmoqda...',
      cls: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    },
  }

  const cfg = configs[status] ?? configs.checking

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${cfg.cls}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

export default function Header({ darkMode, onToggleDark, connectionStatus }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md shrink-0">
              <span className="text-white text-sm font-bold">Q</span>
            </div>
            <div className="hidden sm:block leading-tight">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight whitespace-nowrap">
                Oshxona & Kassa Paneli
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">Fast Food boshqaruv tizimi</p>
            </div>
          </div>
          <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="hidden md:block">
            <LiveClock />
          </div>
        </div>

        {/* Mobile clock */}
        <div className="md:hidden flex-1 flex justify-center">
          <LiveClock />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ConnectionBadge status={connectionStatus} />

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            aria-label={darkMode ? "Yorqin rejimga o'tish" : "Qorong'i rejimga o'tish"}
            className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            style={{
              backgroundColor: darkMode ? '#f97316' : '#cbd5e1',
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300"
              style={{ transform: darkMode ? 'translateX(24px)' : 'translateX(0px)' }}
            >
              {darkMode ? (
                <Moon size={11} className="text-orange-500" />
              ) : (
                <Sun size={11} className="text-slate-400" />
              )}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
