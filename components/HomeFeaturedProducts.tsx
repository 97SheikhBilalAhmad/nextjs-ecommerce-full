'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useCart } from './CartProvider'

type Product = {
  _id: string
  name: string
  price: number
  description?: string
  images?: string[]
}

export default function HomeFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    axios
      .get<Product[]>('/api/products')
      .then((r) => setProducts(r.data))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading || error || products.length === 0) {
    return null
  }

  const featured = products.slice(0, 4)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          Featured picks
        </h2>
        <Link
          href="/products"
          className="text-xs font-semibold text-[#FFD400] hover:underline"
        >
          View full menu
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {featured.map((p) => {
          const image =
            (Array.isArray(p.images) && p.images[0]) ||
            'https://via.placeholder.com/400x300.png?text=Product'
          return (
            <div
              key={p._id}
              className="group flex flex-col rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-black/5 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)] transition"
            >
              <Link
                href={`/products/${p._id}`}
                className="w-full h-52 sm:h-56 overflow-hidden rounded-t-2xl bg-white flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-contain transition group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
                <div>
                  <h3 className="font-semibold text-slate-900 truncate flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-xs sm:text-sm">⭐</span>
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="mt-1 text-[11px] sm:text-xs text-slate-600 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-sm sm:text-base font-semibold text-[#000] bg-[#FFD400] rounded-full px-3 py-1">
                    ${p.price.toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addItem(
                          {
                            id: p._id,
                            name: p.name,
                            price: p.price,
                            image,
                          },
                          1,
                        )
                      }
                      className="inline-flex items-center rounded-full bg-[#FFD400] px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-black hover:bg-[#e6b800]"
                    >
                      Add
                    </button>
                    <Link
                      href={`/products/${p._id}`}
                      className="inline-flex items-center rounded-full border border-black/10 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-800 hover:border-[#FFD400] hover:text-[#FFD400]"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}


