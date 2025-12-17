'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useCart } from '../../../components/CartProvider'
 
type Product = {
  _id: string
  name: string
  price: number
  description?: string
  images?: string[]
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
 
  useEffect(() => {
    axios
      .get<Product>('/api/products/' + params.id)
      .then((r) => setProduct(r.data))
      .catch(() => setError('Failed to load product. Please try again.'))
      .finally(() => setLoading(false))
  }, [params.id])
 
  if (loading) {
    return (
      <section className="space-y-4">
        <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
          <div className="aspect-[4/3] rounded-3xl bg-slate-100 animate-pulse" />
          <div className="space-y-3">
            <div className="h-6 w-40 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
            <div className="h-10 w-32 rounded-full bg-slate-100 animate-pulse" />
          </div>
        </div>
      </section>
    )
  }
 
  if (error || !product) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">Product</h1>
        <p className="text-sm text-red-600">
          {error || 'Product not found.'}
        </p>
      </section>
    )
  }
 
  const image =
    (Array.isArray(product.images) && product.images[0]) ||
    'https://via.placeholder.com/600x450.png?text=Product'
 
  return (
    <section className="space-y-6">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)] items-start">
        <div className="space-y-4 flex justify-center">
          <div className="w-full max-w-xl aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {product.description ||
                'Everyday essential from our general store selection.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-emerald-600">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-1 text-slate-500 hover:text-slate-900"
              >
                −
              </button>
              <span className="mx-3 w-6 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-1 text-slate-500 hover:text-slate-900"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                addItem(
                  {
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    image,
                  },
                  quantity,
                )
              }
              className="inline-flex items-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Add to cart
            </button>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>✔ 2–5 business day delivery on most items</p>
            <p>✔ Secure payment via Stripe</p>
            <p>✔ 14‑day easy returns</p>
          </div>
        </div>
      </div>
    </section>
  )
}
