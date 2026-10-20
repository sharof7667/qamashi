/**
 * Unified data API — transparently uses Supabase or mock mode.
 * All functions return Promises and fire the same shape of data.
 */
import { supabase, isMockMode, mockApi } from './supabase'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

// ─── Sales ────────────────────────────────────────────────────────────────────
export async function fetchTodaySales() {
  if (isMockMode) return mockApi.getSales()

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .gte('created_at', todayStart())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addSale(amount) {
  if (isMockMode) return mockApi.addSale(amount)

  const { data, error } = await supabase
    .from('sales')
    .insert([{ amount }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSale(id) {
  if (isMockMode) return mockApi.deleteSale(id)

  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) throw error
}

// ─── Needed Items ─────────────────────────────────────────────────────────────
export async function fetchActiveItems() {
  if (isMockMode) return mockApi.getItems()

  const { data, error } = await supabase
    .from('needed_items')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addNeededItem(name) {
  if (isMockMode) return mockApi.addItem(name)

  const { data, error } = await supabase
    .from('needed_items')
    .insert([{ name, status: 'pending' }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeNeededItem(id) {
  if (isMockMode) return mockApi.removeItem(id)

  const { error } = await supabase.from('needed_items').delete().eq('id', id)
  if (error) throw error
}

// ─── Realtime subscriptions ───────────────────────────────────────────────────
export function subscribeToSales(onData) {
  if (isMockMode) return mockApi.onSalesChange(onData)

  const channel = supabase
    .channel('sales-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sales' },
      async () => {
        const fresh = await fetchTodaySales()
        onData(fresh)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export function subscribeToItems(onData) {
  if (isMockMode) return mockApi.onItemsChange(onData)

  const channel = supabase
    .channel('items-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'needed_items' },
      async () => {
        const fresh = await fetchActiveItems()
        onData(fresh)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// ─── Connection check ─────────────────────────────────────────────────────────
export async function checkConnection() {
  if (isMockMode) return 'mock'

  try {
    // Ping Supabase health endpoint — doesn't require any table to exist
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    })
    // 200 or 404 (no tables yet) both mean the project is reachable
    return res.status < 500 ? 'connected' : 'error'
  } catch {
    return 'error'
  }
}
