'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '../../../lib/auth'
import useSocket from '../../../lib/useSocket'

type OrderItem = {
  product?: { name?: string }
  qty: number
  price: number
}

type Order = {
  _id: string
  user?: { name?: string; email?: string }
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    | 'all'
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'processing'
    | 'completed'
    | 'paid-test'
  >('all')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [toast, setToast] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') {
      router.replace('/auth/login?from=admin')
      return
    }

    axios
      .get<Order[]>('/api/orders')
      .then((r) => setOrders(r.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [router])

  useSocket({
    joinAdminRoom: true,
    onNewOrder: (data) => {
      setToast(`New order: ${data.customerName || 'Customer'}`)
      setTimeout(() => setToast(null), 3000)
    },
  })

  const updateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId)
      const res = await axios.put<Order>(`/api/orders/${orderId}`, { status })
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: res.data.status } : o)),
      )
    } catch (err) {
      setToast('Failed to update order')
      setTimeout(() => setToast(null), 2500)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        o._id.toLowerCase().includes(search.toLowerCase()) ||
        (o.user?.name || '').toLowerCase().includes(search.toLowerCase())

        const s = o.status.toLowerCase()
        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'completed'
            ? s === 'completed' || s === 'paid-test'
            : s === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedOrders = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  const badgeClasses = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'completed' || s === 'paid-test')
      return 'bg-[#FFD400]/20 text-black border border-[#FFD400]/50'
    if (s === 'pending')
      return 'bg-black text-[#FFD400] border border-black/30'
    if (s === 'accepted')
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    if (s === 'processing')
      return 'bg-blue-50 text-blue-700 border border-blue-200'
    if (s === 'rejected')
      return 'bg-red-50 text-red-700 border border-red-200'
    return 'bg-slate-100 text-slate-700 border border-slate-200'
  }

  return (
    <section className="space-y-6">
      {toast && (
        <div className="rounded-xl border border-black/5 bg-white shadow-sm px-4 py-2 text-sm text-slate-800">
          {toast}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Orders
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            All orders placed in the store.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            placeholder="Search by order or customer"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full sm:w-64 rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-[#FFD400] focus:outline-none focus:ring-1 focus:ring-[#FFD400] bg-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any)
              setPage(1)
            }}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm bg-white focus:border-[#FFD400] focus:outline-none focus:ring-1 focus:ring-[#FFD400]"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="paid-test">Test paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading orders…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No orders found yet.</p>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF4B8] text-left text-xs font-semibold text-slate-800">
              <tr>
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
              </tr>
              </thead>
              <tbody>
              {pagedOrders.map((order, index) => (
                <tr
                  key={order._id}
                  className={`border-t border-slate-100 text-sm ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  } hover:bg-slate-100/70`}
                >
                  <td className="px-4 py-2 text-[11px] text-slate-500 max-w-xs truncate">
                    {order._id}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span>{order.user?.name || 'Guest'}</span>
                      <span className="text-[11px] text-slate-500">
                        {order.user?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <ul className="space-y-1 text-xs text-slate-600">
                      {order.items.map((it, idx) => (
                        <li key={idx}>
                          {it.qty} × {it.product?.name || 'Item'} @ $
                          {it.price.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${badgeClasses(
                      order.status,
                    )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={updatingId === order._id}
                      onClick={() => updateStatus(order._id, 'accepted')}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:border-emerald-300 disabled:opacity-40"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === order._id}
                      onClick={() => updateStatus(order._id, 'processing')}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:border-blue-300 disabled:opacity-40"
                    >
                      Processing
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === order._id}
                      onClick={() => updateStatus(order._id, 'rejected')}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:border-red-300 disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </div>
                </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {currentPage} of {totalPages} · {filtered.length} orders
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40 hover:border-[#66b07a] hover:text-[#66b07a]"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                className="rounded-full border border-slate-200 px-3 py-1 disabled:opacity-40 hover:border-[#66b07a] hover:text-[#66b07a]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}


