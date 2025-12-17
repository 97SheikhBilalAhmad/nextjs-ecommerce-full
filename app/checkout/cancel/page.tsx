import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <section className="max-w-lg mx-auto text-center space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">
        Payment cancelled
      </h1>
      <p className="text-sm text-slate-600">
        Your Stripe payment was cancelled. You can review your cart and try
        again when you are ready.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Link
          href="/cart"
          className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Back to cart
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center rounded-full border border-slate-200 px-6 py-2 text-sm font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
        >
          Continue shopping
        </Link>
      </div>
    </section>
  )
}







