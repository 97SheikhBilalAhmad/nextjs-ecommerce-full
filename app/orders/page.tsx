'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { getCurrentUser } from '../../lib/auth'
import useCustomerSocket, {
  type CustomerOrderUpdate,
} from '../../lib/useCustomerSocket'

type OrderRow = {
  orderId: string
  status: string
  items: { name?: string; qty?: number; price?: number }[]
  message?: string
}

type OrderHistoryRow = {
  orderId: string
  status: string
  items: { productName: string; quantity: number; price: number }[]
  total: number
  createdAt: string
}

export default function CustomerOrdersPage() {
  const user = getCurrentUser()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [history, setHistory] = useState<OrderHistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      axios
        .get<OrderRow[]>(`/api/orders/customer-notifications?customerId=${user.id}`)
        .catch(() => ({ data: [] })),
      axios
        .get<OrderHistoryRow[]>(`/api/orders/customer/${user.id}`)
        .catch(() => ({ data: [] })),
    ])
      .then(([notifRes, historyRes]) => {
        setOrders(notifRes.data || [])
        setHistory(historyRes.data || [])
      })
      .finally(() => setLoading(false))
  }, [user])

  useCustomerSocket(
    user
      ? {
          customerId: user.id,
          onOrderUpdate: (data: CustomerOrderUpdate) => {
            setOrders((prev) => {
              const existingIdx = prev.findIndex((o) => o.orderId === data.orderId)
              const updated: OrderRow = {
                orderId: data.orderId,
                status: data.status,
                items: data.items || [],
                message: data.message,
              }
              if (existingIdx >= 0) {
                const clone = [...prev]
                clone[existingIdx] = { ...clone[existingIdx], ...updated }
                return clone
              }
              return [updated, ...prev]
            })
            setHistory((prev) => {
              const idx = prev.findIndex((o) => o.orderId === data.orderId)
              if (idx >= 0) {
                const clone = [...prev]
                clone[idx] = { ...clone[idx], status: data.status }
                return clone
              }
              return prev
            })
            if (data.message) {
              setToast(data.message)
              setTimeout(() => setToast(null), 3000)
            }
          },
        }
      : undefined,
  )

  const statusColor = (s: string) => {
    const val = s.toLowerCase()
    if (val === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (val === 'accepted') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (val === 'processing') return 'bg-blue-50 text-blue-700 border-blue-200'
    if (val === 'rejected') return 'bg-red-50 text-red-700 border-red-200'
    if (val === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const emptyState = !loading && orders.length === 0 && history.length === 0

  if (!user) {
    return (
      <section className="max-w-3xl mx-auto py-10 space-y-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-600">
          Please sign in to view your order updates.
        </p>
        <div className="pt-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center rounded-full bg-black px-6 py-2 text-sm font-semibold text-white hover:bg-[#111]"
          >
            Sign in
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-4xl mx-auto py-8 space-y-4">
      {toast && (
        <div className="rounded-xl border border-black/5 bg-white shadow-sm px-4 py-2 text-sm text-slate-800">
          {toast}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your orders</h1>
          <p className="text-sm text-slate-600">
            Live updates for your orders. We’ll notify you as soon as status changes.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading your orders…</p>
      ) : emptyState ? (
        <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">No orders yet.</p>
          <div className="pt-3">
            <Link
              href="/products"
              className="inline-flex items-center rounded-full bg-[#FFD400] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e6b800]"
            >
              Browse menu
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Live notifications
              </h2>
              <p className="text-xs text-slate-500">
                Newest updates will appear here instantly.
              </p>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF4B8] text-left text-xs font-semibold text-slate-800">
                <tr>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">Items</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-sm text-slate-500 text-center"
                    >
                      No live updates yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o, idx) => (
                    <tr
                      key={o.orderId}
                      className={`border-t border-slate-100 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-[12px] text-slate-600 max-w-xs truncate">
                        {o.orderId}
                      </td>
                      <td className="px-4 py-3">
                        <ul className="space-y-1 text-xs text-slate-700">
                          {o.items?.map((it, i) => (
                            <li key={i}>
                              {it.qty ?? 0} × {it.name || 'Item'}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusColor(
                            o.status,
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {o.message || `Your order is ${o.status}.`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                Order history
              </h2>
              <p className="text-xs text-slate-500">
                All your orders sorted by most recent.
              </p>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF4B8] text-left text-xs font-semibold text-slate-800">
                <tr>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">Items</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-sm text-slate-500 text-center"
                    >
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  history.map((o, idx) => (
                    <tr
                      key={o.orderId}
                      className={`border-t border-slate-100 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-[12px] text-slate-600 max-w-xs truncate">
                        {o.orderId}
                      </td>
                      <td className="px-4 py-3">
                        <ul className="space-y-1 text-xs text-slate-700">
                          {o.items?.map((it, i) => (
                            <li key={i}>
                              {it.quantity ?? 0} × {it.productName || 'Item'}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusColor(
                            o.status,
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        ${o.total?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

