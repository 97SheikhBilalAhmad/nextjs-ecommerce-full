'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/components/CartProvider'

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    clearCart()
    const confirm = async () => {
      if (!sessionId) return
      setConfirming(true)
      try {
        await fetch('/api/checkout/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
      } catch (err) {
        console.error('Failed to confirm order', err)
      } finally {
        setConfirming(false)
      }
    }
    confirm()
  }, [sessionId])

  return (
    <section className="relative z-0 min-h-[70vh] flex items-center justify-center px-4 py-10 bg-[#fff9e6]">
      <div className="max-w-lg w-full text-center space-y-4 pointer-events-auto">
        <h1 className="text-2xl font-bold text-slate-900">
          Payment successful
        </h1>
        <p className="text-sm text-slate-600">
          Thank you for your order. A confirmation email will be sent to you
          shortly. You can continue browsing the store for more everyday
          essentials.
        </p>
        {confirming ? (
          <p className="text-xs text-slate-500">
            Finalizing your order…
          </p>
        ) : null}
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/products"
            className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-200 px-6 py-2 text-sm font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  )
}






