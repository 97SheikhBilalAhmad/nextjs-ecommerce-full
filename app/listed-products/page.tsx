'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth'

type Product = {
  _id: string
  name: string
  price: number
  description?: string
  images?: string[]
}

type ListedEntry = {
  category: string
  product: Product
}

function formatCategory(category: string) {
  if (category === 'groceries') return 'Groceries'
  if (category === 'home-living') return 'Home & Living'
  if (category === 'electronics') return 'Electronics'
  if (category === 'personal-care') return 'Personal Care'
  if (category === 'uncategorized') return 'Uncategorized'
  return category || 'Uncategorized'
}

export default function ListedProductsPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [items, setItems] = useState<ListedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') {
      router.replace('/auth/login?from=admin')
      return
    }
    setAllowed(true)

    axios
      .get<ListedEntry[]>('/api/listed-products')
      .then((r) => setItems(r.data))
      .catch(() => setError('Failed to load listed products.'))
      .finally(() => setLoading(false))
  }, [router])

  if (!allowed) {
    return (
      <section>
        <h1 className="text-2xl font-bold mb-4">Listed products</h1>
        <p className="text-sm text-slate-600">Checking admin access…</p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Listed products by category
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          One representative product from each category. Use this view for a
          quick overview of what&apos;s currently live.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading listed products…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">
          No products listed yet. Add products in the admin products section.
        </p>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ category, product }) => {
            const image =
              (Array.isArray(product.images) && product.images[0]) ||
              'https://via.placeholder.com/400x300.png?text=Product'
            const label = formatCategory(category)
            return (
              <div
                key={category}
                className="flex flex-col rounded-2xl border border-black/5 bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)] overflow-hidden"
              >
                <div className="w-full h-32 sm:h-36 bg-white overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                      {product.name}
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-[#FFD400]/20 px-2 py-0.5 text-[10px] font-medium text-black whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <p className="text-xs sm:text-sm font-semibold text-black bg-[#FFD400] inline-flex rounded-full px-3 py-1">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}


