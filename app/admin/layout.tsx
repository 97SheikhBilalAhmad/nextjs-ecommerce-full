'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') {
      router.replace('/auth/login?from=admin')
    } else {
      setAllowed(true)
    }
  }, [router])

  if (!allowed) {
    return (
      <section className="p-4">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">Admin panel</h1>
        <p className="text-sm text-slate-600">Checking admin access…</p>
      </section>
    )
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname?.startsWith(href))

  return (
    <div className="flex gap-3 min-h-[calc(100vh-4rem)] bg-[#fff9e6] px-2 sm:px-3 py-3">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col rounded-xl bg-black text-white shadow-lg">
        <div className="px-4 py-4 border-b border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#FFCC00]">
            Admin panel
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            Golden Feast
          </p>
        </div>
        <nav className="flex-1 py-3 text-sm text-white space-y-1">
          <Link
            href="/admin"
            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg ${
              isActive('/admin')
                ? 'bg-[#FFCC00] text-black'
                : 'text-white hover:bg-[#FFCC00] hover:text-black'
            }`}
          >
            <span className="h-6 w-6 rounded-md bg-white/10 text-white flex items-center justify-center text-xs">
              🏠
            </span>
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg ${
              isActive('/admin/products')
                ? 'bg-[#FFCC00] text-black'
                : 'text-white hover:bg-[#FFCC00] hover:text-black'
            }`}
          >
            <span className="h-6 w-6 rounded-md bg-white/10 text-white flex items-center justify-center text-xs">
              📦
            </span>
            Products
          </Link>
          <Link
            href="/listed-products"
            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg ${
              isActive('/listed-products')
                ? 'bg-[#FFCC00] text-black'
                : 'text-white hover:bg-[#FFCC00] hover:text-black'
            }`}
          >
            <span className="h-6 w-6 rounded-md bg-white/10 text-white flex items-center justify-center text-xs">
              🗂
            </span>
            Categories
          </Link>
          <Link
            href="/admin/orders"
            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg ${
              isActive('/admin/orders')
                ? 'bg-[#FFCC00] text-black'
                : 'text-white hover:bg-[#FFCC00] hover:text-black'
            }`}
          >
            <span className="h-6 w-6 rounded-md bg-white/10 text-white flex items-center justify-center text-xs">
              📑
            </span>
            Orders
          </Link>
          <Link
            href="/admin/settings"
            className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg ${
              isActive('/admin/settings')
                ? 'bg-[#FFCC00] text-black'
                : 'text-white hover:bg-[#FFCC00] hover:text-black'
            }`}
          >
            <span className="h-6 w-6 rounded-md bg-white/10 text-white flex items-center justify-center text-xs">
              ⚙️
            </span>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-5">{children}</main>
    </div>
  )
}




