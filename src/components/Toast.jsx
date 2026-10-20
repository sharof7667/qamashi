import { useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
}

const BORDERS = {
  success: 'border-l-4 border-emerald-400',
  error: 'border-l-4 border-red-400',
  info: 'border-l-4 border-blue-400',
}

export default function Toast({ toasts, onDismiss }) {
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const id = setTimeout(() => onDismiss(toast.id), 3500)
    return () => clearTimeout(id)
  }, [toast.id, onDismiss])

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 min-w-[280px] max-w-sm animate-slide-up ${BORDERS[toast.type] ?? ''}`}
    >
      {ICONS[toast.type] ?? ICONS.info}
      <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-300 transition-colors ml-1"
        aria-label="Yopish"
      >
        <X size={15} />
      </button>
    </div>
  )
}
