'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useCart } from '../../components/CartProvider'
import { useSearchParams } from 'next/navigation'

type Product = {
  _id: string
  name: string
  price: number
  description?: string
  images?: string[]
  category?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()
  const searchParams = useSearchParams()
 
  useEffect(() => {
    axios
      .get<Product[]>('/api/products')
      .then((r) => setProducts(r.data))
      .catch(() => setError('Failed to load products. Please try again.'))
      .finally(() => setLoading(false))
  }, [])
 
  if (loading) {
    return (
      <section className="space-y-4">
        <div className="h-7 w-40 rounded bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-white shadow-sm border border-slate-100 p-4 space-y-3"
            >
              <div className="h-6 w-3/4 rounded bg-slate-100 animate-pulse" />
              <div className="h-4 w-1/3 rounded bg-slate-100 animate-pulse" />
              <div className="h-8 w-full rounded-full bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    )
  }
 
  if (error) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <p className="text-sm text-red-600">{error}</p>
      </section>
    )
  }
 
  const activeCategory = searchParams?.get('category') || null
  const filtered =
    activeCategory != null
      ? products.filter(
          (p) =>
            p.category &&
            p.category.toLowerCase() === activeCategory.toLowerCase(),
        )
      : products

  if (filtered.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Menu</h1>
        {activeCategory ? (
          <p className="text-sm text-slate-600">
            No products for this category yet.
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            No products are available yet. Please check back soon.
          </p>
        )}
      </section>
    )
  }
 
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeCategory ? 'Category items' : 'All menu items'}
          </h1>
          <p className="text-sm text-slate-500">
            {activeCategory
              ? `Showing products in "${activeCategory}" category.`
              : 'Burgers, pizzas, fries, drinks, and more—pick your favorites.'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const image =
            (Array.isArray(p.images) && p.images[0]) ||
            'https://via.placeholder.com/400x300.png?text=Product'
          return (
            <div
              key={p._id}
              className="group flex flex-col rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-[#FFD400] hover:shadow-md transition"
            >
              <Link
                href={`/products/${p._id}`}
                className="w-full h-48 sm:h-56 overflow-hidden rounded-t-2xl bg-white flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={p.name}
                  className="h-full w-full object-contain"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div>
                  <h3 className="font-semibold text-slate-900 truncate">
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-base font-semibold text-emerald-600">
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
                      className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Add to cart
                    </button>
                    <Link
                      href={`/products/${p._id}`}
                      className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-600"
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
