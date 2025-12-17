'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '../../components/CartProvider'
import { getCurrentUser } from '../../lib/auth'

export default function CartPage() {
  const { items, subtotal, totalItems, updateQuantity, removeItem } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    if (items.length === 0) return
    const user = getCurrentUser()
    if (!user) {
      router.push('/auth/login?from=checkout')
      return
    }
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <section className="max-w-3xl mx-auto space-y-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart</h1>
        <p className="text-sm text-slate-600">
          Your cart is empty. Start adding some items from the store.
        </p>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Browse products
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)] items-start">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Your cart</h1>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="h-20 w-24 overflow-hidden rounded-xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    item.image ||
                    'https://via.placeholder.com/200x150.png?text=Product'
                  }
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-slate-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="px-1 text-slate-500 hover:text-slate-900"
                    >
                      −
                    </button>
                    <span className="mx-3 w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="px-1 text-slate-500 hover:text-slate-900"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Order summary
        </h2>
        <dl className="space-y-2 text-sm text-slate-600">
          <div className="flex justify-between">
            <dt>Items</dt>
            <dd>{totalItems}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>${subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <dt>Shipping</dt>
            <dd>Calculated at checkout</dd>
          </div>
        </dl>
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">Total</span>
          <span className="text-lg font-semibold text-emerald-600">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          className="w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Proceed to checkout
        </button>
        <p className="text-[11px] text-slate-500">
          You will be redirected to a secure Stripe payment page to complete
          your order.
        </p>
      </aside>
    </section>
  )
}


