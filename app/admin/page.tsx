'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import axios from 'axios'

type OrderSummary = {
  _id: string
  total: number
  status: string
  createdAt: string
  items?: { product?: { _id?: string; name?: string }; qty: number }[]
}

type ProductSummary = {
  _id: string
  name: string
  price: number
  category?: string
  images?: string[]
  description?: string
  inventory?: number
}

type CurrentUser = {
  email?: string
  role?: string
}

type Settings = {
  fullName?: string
  adminEmail?: string
  logoUrl?: string
  storeName?: string
}

export default function Admin() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<CurrentUser | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    const user = getCurrentUser() as CurrentUser | null
    if (!user || user.role !== 'admin') {
      router.replace('/auth/login?from=admin')
    } else {
      setAllowed(true)
      setAdminUser(user)
      Promise.all([
        axios.get<OrderSummary[]>('/api/orders').catch(() => ({ data: [] })),
        axios.get<ProductSummary[]>('/api/products').catch(() => ({ data: [] })),
        axios.get<{ settings: Settings }>('/api/settings').catch(() => ({ data: {} as any })),
      ]).then(([ordersRes, productsRes, settingsRes]) => {
        setOrders(ordersRes.data || [])
        setProducts(productsRes.data || [])
        setSettings(settingsRes.data?.settings || null)
        setLoading(false)
      })
    }
  }, [router])

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total || 0), 0),
    [orders],
  )
  const totalOrders = orders.length
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'pending').length,
    [orders],
  )
  const categoryCount = useMemo(() => {
    const set = new Set(
      products.map((p) => (p.category && p.category.trim()) || 'Uncategorized'),
    )
    return set.size
  }, [products])
  const lowStockCount = useMemo(
    () =>
      products.filter(
        (p) =>
          typeof p.inventory === 'number' &&
          !Number.isNaN(p.inventory) &&
          p.inventory <= 5,
      ).length,
    [products],
  )

  const categorySamples = useMemo(
    () => {
      const byCategory = new Map<string, ProductSummary>()
      for (const p of products) {
        const key = p.category || 'uncategorized'
        if (!byCategory.has(key)) {
          byCategory.set(key, p)
        }
      }
      return Array.from(byCategory.entries()).map(([category, product]) => ({
        category,
        product,
      }))
    },
    [products],
  )

  const salesBars = useMemo(() => {
    if (!orders.length) return []
    const last = orders.slice(-7)
    const amounts = last.map((o) => o.total || 0)
    const max = Math.max(...amounts, 1)
    return amounts.map((v) => v / max)
  }, [orders])

  const categoryDistribution = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of products) {
      const key = p.category || 'Uncategorized'
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    return Array.from(counts.entries())
  }, [products])

  const bestSellers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; qty: number }>()
    for (const o of orders) {
      o.items?.forEach((it) => {
        const id = (it.product?._id as string) || ''
        const name = it.product?.name || 'Product'
        if (!id) return
        const current = map.get(id) || { id, name, qty: 0 }
        current.qty += it.qty || 0
        map.set(id, current)
      })
    }
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [orders])

  if (!allowed) {
    return (
      <section>
        <h1 className="text-2xl font-bold mb-4">Admin dashboard</h1>
        <p className="text-sm text-slate-600">Checking admin access…</p>
      </section>
    )
  }

  return (
    <section className="space-y-5">
      {/* Top nav */}
      <header className="rounded-xl border border-black/5 bg-white px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Fast-food performance, orders, and menu at a glance.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="h-8 w-8 rounded-full bg-black text-[#FFCC00] flex items-center justify-center text-sm hover:bg-[#111]"
          >
            🔔
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900">
                {settings?.fullName || 'Admin'}
              </span>
              <span className="text-[11px] text-slate-600">
                {settings?.adminEmail || adminUser?.email || 'admin@gmail.com'}
              </span>
            </div>
            {settings?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={settings.fullName || 'Admin'}
                className="h-9 w-9 rounded-full object-cover border-2 border-[#FFCC00]"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-[#FFCC00] text-black flex items-center justify-center text-sm font-semibold">
                {(settings?.fullName || 'A').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Analytics cards */}
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">Menu items</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {products.length}
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">Categories</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {categoryCount}
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalOrders}
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">Low stock</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {lowStockCount}
          </p>
        </div>
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">Pending orders</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {pendingOrders}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
        {/* Sales overview */}
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Sales overview
            </h2>
            <span className="text-[11px] text-slate-600">
              Last {salesBars.length || 0} orders
            </span>
          </div>
          {salesBars.length === 0 ? (
            <p className="text-sm text-slate-600">
              Not enough data yet. Orders will appear here as sales come in.
            </p>
          ) : (
            <div className="flex items-end gap-2 h-32 mt-4">
              {salesBars.map((value, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t-full bg-[#FFCC00]/20 overflow-hidden"
                >
                  <div
                    style={{ height: `${value * 100}%` }}
                    className="w-full bg-[#FFCC00] rounded-t-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category distribution */}
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Category distribution
            </h2>
            <span className="text-[11px] text-slate-600">
              {categoryDistribution.length} categories
            </span>
          </div>
          {categoryDistribution.length === 0 ? (
            <p className="text-sm text-slate-600">
              No products yet. Category breakdown will appear here once you add items.
            </p>
          ) : (
            <div className="space-y-2 mt-2">
              {categoryDistribution.map(([cat, count]) => {
                const percentage =
                  products.length > 0 ? (count / products.length) * 100 : 0
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{cat}</span>
                      <span className="text-slate-600">
                        {count} · {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full rounded-full bg-[#FFCC00]"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tables / lists row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#FFCC00] hover:underline"
            >
              View all
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-slate-600">Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-slate-600">
              No orders yet. Once customers complete checkout, they&apos;ll appear here.
            </p>
          ) : (
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-slate-600 border-b border-slate-100">
                  <th className="py-2 pr-2">Order</th>
                  <th className="py-2 pr-2">Total</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((o) => (
                  <tr key={o._id} className="border-b border-slate-50">
                    <td className="py-2 pr-2 text-slate-900">
                      #{o._id.slice(-6)}
                    </td>
                    <td className="py-2 pr-2 text-slate-900">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="py-2 pr-2">
                      <span className="inline-flex items-center rounded-full bg-black text-[#FFCC00] px-2 py-0.5 text-[11px] capitalize">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2 text-[11px] text-slate-600">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Best selling products */}
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Best selling items
            </h2>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-[#FFCC00] hover:underline"
            >
              Manage
            </Link>
          </div>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-slate-600">
              No sales data yet. Once orders include products, the top items will appear here.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {bestSellers.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#FFF4B8] px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 truncate">
                      {b.name}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      ID: {b.id}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-black">
                    {b.qty} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

