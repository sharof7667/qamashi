import { useState, useEffect } from 'react'
import { Plus, Trash2, Package, Send, X, Copy, Check } from 'lucide-react'
import { fetchActiveItems, addNeededItem, removeNeededItem, subscribeToItems } from '../lib/api'

function formatTime(iso) {
  const d = new Date(iso)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function SendModal({ items, onClose, onToast }) {
  const [copied, setCopied] = useState(false)

  const message =
    '📦 Fast Food — Kerakli mahsulotlar:\n\n' +
    items.map((i) => `• ${i.name}`).join('\n')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onToast("Ro'yxat egasiga yuborildi!", 'success')
      setTimeout(onClose, 1200)
    } catch {
      onToast("Nusxalashda xatolik yuz berdi.", 'error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Send size={18} className="text-orange-500" />
            <h3 className="font-bold text-slate-900 dark:text-slate-50">
              Xabarni ko'rib chiqing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message preview */}
        <div className="p-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mb-3">
            Telegram xabari ko'rinishi
          </p>
          <div className="bg-slate-50 dark:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-600 p-4 font-mono text-sm text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed">
            {message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold text-sm shadow-md shadow-orange-200 dark:shadow-orange-900/40 transition-all"
          >
            {copied ? (
              <>
                <Check size={16} />
                Yuborildi!
              </>
            ) : (
              <>
                <Copy size={16} />
                Yuborish
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SuppliesModule({ onToast }) {
  const [items, setItems] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchActiveItems().then(setItems).catch(() => setItems([]))
    const unsub = subscribeToItems(setItems)
    return unsub
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    const name = inputValue.trim()
    if (!name) return
    setLoading(true)
    try {
      await addNeededItem(name)
      setInputValue('')
      onToast("Mahsulot ro'yxatga qo'shildi!", 'success')
    } catch {
      onToast('Xatolik yuz berdi. Qayta urinib ko\'ring.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(id) {
    setRemoving(id)
    try {
      await removeNeededItem(id)
      onToast("Mahsulot o'chirildi.", 'info')
    } catch {
      onToast("O'chirishda xatolik.", 'error')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <>
      <section className="flex flex-col gap-5">
        {/* Section header card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 p-6 shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white" />
            <div className="absolute -bottom-12 -left-4 w-56 h-56 rounded-full bg-white" />
          </div>
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium mb-1">Kerakli mahsulotlar</p>
              <p className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
                {items.length} ta mahsulot
              </p>
              <p className="text-violet-100 text-sm mt-2">
                {items.length === 0
                  ? "Hozircha ro'yxat bo'sh"
                  : "Egaga yuborishga tayyor"}
              </p>
            </div>
            <div className="bg-white/20 rounded-2xl p-3">
              <Package size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Add item form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Yangi mahsulot qo'shish
          </h2>
          <form onSubmit={handleAdd} className="flex gap-2">
            <div className="relative flex-1">
              <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nima kerak? (masalan: Sosiska, Ketchup, Non)"
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent text-sm transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 active:scale-95 text-white font-semibold text-sm shadow-md shadow-violet-200 dark:shadow-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Qo'shish</span>
              <span className="sm:hidden">+</span>
            </button>
          </form>
        </div>

        {/* Items list */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Joriy ro'yxat
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400 dark:text-slate-500">
              <Package size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Ro'yxat hozircha bo'sh</p>
              <p className="text-xs mt-1">Kerakli mahsulotni qo'shing</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors animate-slide-up"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {formatTime(item.created_at)} da qo'shildi
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removing === item.id}
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

        {/* Send to owner button */}
        <button
          onClick={() => setShowModal(true)}
          disabled={items.length === 0}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-violet-200 dark:shadow-violet-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Send size={20} />
          Egasiga ro'yxatni yuborish
        </button>
      </section>

      {showModal && (
        <SendModal
          items={items}
          onClose={() => setShowModal(false)}
          onToast={onToast}
        />
      )}
    </>
  )
}
