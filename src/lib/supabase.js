import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Mock mode only if env vars are completely missing
export const isMockMode = !supabaseUrl || !supabaseAnonKey

export const supabase = isMockMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    })

// ─── Mock data store ──────────────────────────────────────────────────────────
let mockSales = [
  {
    id: 'mock-1',
    amount: 45000,
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
  {
    id: 'mock-2',
    amount: 120000,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
]

let mockItems = [
  {
    id: 'item-1',
    name: 'Sosiska',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
]

let saleListeners = []
let itemListeners = []

function notifySales() {
  saleListeners.forEach((cb) => cb([...mockSales]))
}
function notifyItems() {
  itemListeners.forEach((cb) => cb([...mockItems]))
}

export const mockApi = {
  getSales() {
    return Promise.resolve([...mockSales])
  },
  addSale(amount) {
    const sale = {
      id: `mock-${Date.now()}`,
      amount,
      created_at: new Date().toISOString(),
    }
    mockSales = [sale, ...mockSales]
    notifySales()
    return Promise.resolve(sale)
  },
  deleteSale(id) {
    mockSales = mockSales.filter((s) => s.id !== id)
    notifySales()
    return Promise.resolve()
  },
  onSalesChange(cb) {
    saleListeners.push(cb)
    return () => {
      saleListeners = saleListeners.filter((l) => l !== cb)
    }
  },

  getItems() {
    return Promise.resolve([...mockItems])
  },
  addItem(name) {
    const item = {
      id: `item-${Date.now()}`,
      name,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    mockItems = [item, ...mockItems]
    notifyItems()
    return Promise.resolve(item)
  },
  removeItem(id) {
    mockItems = mockItems.filter((i) => i.id !== id)
    notifyItems()
    return Promise.resolve()
  },
  onItemsChange(cb) {
    itemListeners.push(cb)
    return () => {
      itemListeners = itemListeners.filter((l) => l !== cb)
    }
  },
}
