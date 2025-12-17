'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCart } from './CartProvider'
import { getCurrentUser, clearToken, type CurrentUser } from '../lib/auth'

export default function Header() {
  const { totalItems } = useCart()
  const pathname = usePathname() || '/'
  const router = useRouter()
  const isAdminRoute = pathname.startsWith('/admin')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [branding, setBranding] = useState<{ name: string; logoUrl: string }>({
    name: 'Golden Feast',
    logoUrl: '',
  })
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [pathname])

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) return
        const data = await res.json()
        const s = data?.settings || {}
        setBranding({
          name: s.storeName || 'Golden Feast',
          logoUrl: s.logoUrl || '',
        })
      } catch (err) {
        console.error('Failed to load branding', err)
      }
    }
    loadBranding()
  }, [])

  const handleLogout = () => {
    clearToken()
    setCurrentUser(null)
    setNotice('Logged out')
    setTimeout(() => setNotice(null), 2500)
    router.push('/')
  }

  return (
    <header className="bg-black text-white sticky top-0 z-30 shadow-lg">
      {notice ? (
        <div className="absolute right-4 top-3 z-40 rounded-full bg-white text-black px-3 py-1 text-xs shadow">
          {notice}
        </div>
      ) : null}
      <div className="w-full py-4 flex items-center justify-between gap-4 px-2 sm:px-3">
        <Link href="/" className="flex items-center gap-3">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={branding.name}
              className="h-10 w-10 rounded-full object-cover border-2 border-[#FFCC00]"
            />
          ) : (
            <span className="rounded-full bg-[#FFCC00] text-black w-9 h-9 flex items-center justify-center text-lg font-extrabold">
              GF
            </span>
          )}
          <span className="font-semibold text-lg tracking-tight text-white">
            {branding.name || 'Golden Feast'}
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          {!isAdminRoute && (
            <>
              <Link
                href="/products"
                className="text-white hover:text-[#FFCC00] transition-colors"
              > 
                Menu
              </Link>
              <Link
                href="/cart"
                className="relative text-white hover:text-[#FFCC00] transition-colors"
              >
                Cart
                {totalItems > 0 && (
                  <span className="absolute -right-3 -top-2 min-w-[1.25rem] rounded-full bg-[#FFCC00] px-1 text-[10px] font-bold text-black text-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </>
          )}
          {currentUser?.role === 'admin' && (
            <Link
              href="/admin"
              className="text-xs font-semibold text-white hover:text-[#FFCC00] transition-colors"
            >
              Admin
            </Link>
          )}
          {!currentUser ? (
            <Link
              href="/auth/login"
              className="inline-flex rounded-full border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-colors"
            >
              Sign in
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex rounded-full border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-colors"
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
