'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '../../components/CartProvider'
import { getCurrentUser } from '../../lib/auth'

export default function CheckoutPage() {
  const { items, subtotal } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.replace('/auth/login?from=checkout')
      return
    }
    if (items.length === 0) {
      router.replace('/cart')
    }
  }, [items, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const origin =
        typeof window !== 'undefined' && window.location
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || ''

      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          successUrl: `${origin}/checkout/success`,
          cancelUrl: `${origin}/checkout/cancel`,
          shipping: { name, address, city, postalCode, country },
          testMode,
        }),
      })
      if (!res.ok) {
        throw new Error('Failed to start checkout')
      }
      const data = await res.json()
      if (data.testPayment) {
        // In test mode we bypass Stripe and treat the order as paid
        router.push('/checkout/success')
      } else if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('Stripe URL missing')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <section className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-start">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter your shipping details and confirm your order. Payment is
            processed securely using Stripe.
          </p>
        </div>
        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Shipping information
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700">
                Full name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700">
                Address
              </label>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                City
              </label>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Postal code
              </label>
              <input
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700">
                Country
              </label>
              <input
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-600 mt-1">
              {error}
            </p>
          )}
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
            />
            <span>
              Test mode (bypass real card payment and create a dummy paid
              order)
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading
              ? testMode
                ? 'Placing test order…'
                : 'Redirecting to Stripe…'
              : testMode
              ? 'Place test order'
              : 'Pay securely with Stripe'}
          </button>
        </div>
      </form>

      <aside className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Order summary
        </h2>
        <div className="space-y-2 max-h-64 overflow-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs text-slate-700"
            >
              <div className="flex-1 pr-2">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-slate-500">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <span className="font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Shipping</span>
            <span>Calculated at payment</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          By placing your order, you agree to our store terms and privacy
          policy. Payments are processed by Stripe and your card details are
          never stored on our servers.
        </p>
      </aside>
    </section>
  )
}


