import { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingUp, Banknote } from 'lucide-react'
import { fetchTodaySales, addSale, deleteSale, subscribeToSales } from '../lib/api'

function formatSum(n) {
  return new Intl.NumberFormat('uz-UZ').format(n) + " so'm"
}

function formatTime(iso) {
  const d = new Date(iso)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

const QUICK_AMOUNTS = [
  { label: '+10 000', value: 10000 },
  { label: '+20 000', value: 20000 },
  { label: '+50 000', value: 50000 },
  { label: '+100 000', value: 100000 },
]

export default function SalesModule({ onToast }) {
  const [sales, setSales] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchTodaySales().then(setSales).catch(() => setSales([]))
    const unsub = subscribeToSales(setSales)
    return unsub
  }, [])

  const total = sales.reduce((sum, s) => sum + Number(s.amount), 0)

  async function handleAdd(amount) {
    const n = Number(amount)
    if (!n || n <= 0) return
    setLoading(true)
    try {
      await addSale(n)
      setInputValue('')
      onToast('Savdo muvaffaqiyatli qo\'shildi!', 'success')
    } catch {
      onToast('Xatolik yuz berdi. Qayta urinib ko\'ring.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await deleteSale(id)
      onToast('Savdo o\'chirildi.', 'info')
    } catch {
      onToast('O\'chirishda xatolik yuz berdi.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleQuickAdd = (amount) => handleAdd(amount)

  const handleSubmit = (e) => {
    e.preventDefault()
    handleAdd(inputValue)
  }

  return (
    <section className="flex flex-col gap-5">
      {/* Stat card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 p-6 shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white" />
          <div className="absolute -bottom-12 -left-4 w-56 h-56 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium mb-1">Bugungi jami savdo</p>
            <p className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatSum(total)}
            </p>
            <p className="text-orange-100 text-sm mt-2">
              {sales.length} ta tranzaksiya
            </p>
          </div>
          <div className="bg-white/20 rounded-2xl p-3">
            <TrendingUp size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Add sale form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Yangi savdo qo'shish
        </h2>

        {/* Quick add buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {QUICK_AMOUNTS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleQuickAdd(value)}
              disabled={loading}
              className="py-2.5 rounded-xl border-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 font-semibold text-sm hover:bg-orange-50 dark:hover:bg-orange-900/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Manual input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Banknote size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Savdo summasini kiriting (so'm)"
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue || loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold text-sm shadow-md shadow-orange-200 dark:shadow-orange-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Savdo qo'shish</span>
            <span className="sm:hidden">+</span>
          </button>
        </form>
      </div>

      {/* Sales history */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Bugungi tranzaksiyalar
          </h2>
        </div>

        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400 dark:text-slate-500">
            <Banknote size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Hali savdo yo'q</p>
            <p className="text-xs mt-1">Birinchi savdoni qo'shing</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto">
            {sales.map((sale) => (
              <li
                key={sale.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors animate-slide-up"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {formatSum(sale.amount)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatTime(sale.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(sale.id)}
                  disabled={deleting === sale.id}
                  aria-label="O'chirish"
                  className="p-2 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90 transition-all disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
