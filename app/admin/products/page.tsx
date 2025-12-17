'use client'

import { FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import { getCurrentUser } from '../../../lib/auth'
import { useRouter } from 'next/navigation'

type Product = {
  _id: string
  name: string
  price: number
  description?: string
  images?: string[]
  inventory?: number
  category?: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [inventory, setInventory] = useState('')
  const [category, setCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [lastCreated, setLastCreated] = useState<Product | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadProducts = () => {
    setLoading(true)
    setError(null)
    axios
      .get<Product[]>('/api/products')
      .then((r) => setProducts(r.data))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') {
      router.replace('/auth/login?from=admin')
      return
    }
    loadProducts()
  }, [router])

  const handleGenerateDescription = () => {
    if (!name) {
      setError('Please enter a product name before using AI description.')
      return
    }
    const niceCategory =
      category === 'groceries'
        ? 'grocery item'
        : category === 'home-living'
        ? 'home & living product'
        : category === 'electronics'
        ? 'electronic accessory'
        : category === 'personal-care'
        ? 'personal care product'
        : 'everyday product'

    const base = `Introducing ${name}, a ${niceCategory} designed for everyday use. It offers reliable quality, modern styling and great value, making it a smart choice for your daily routine. Perfect for customers who want something practical, easy to use and ready to enjoy right out of the box.`

    setDescription(base)
    setError(null)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !price || !category) {
      setError('Name, price and category are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const body: Partial<Product> = {
        name,
        price: Number(price),
        description: description || undefined,
        images: imageUrl ? [imageUrl] : undefined,
        inventory: inventory ? Number(inventory) : undefined,
        category,
      }
      let res
      if (editingId) {
        res = await axios.put<Product>(`/api/products/${editingId}`, body)
      } else {
        res = await axios.post<Product>('/api/products', body)
      }
      setLastCreated(res.data)
      setName('')
      setPrice('')
      setDescription('')
      setImageUrl('')
      setInventory('')
      setCategory('')
      setEditingId(null)
      loadProducts()
    } catch {
      setError('Failed to create product.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (p: Product) => {
    setEditingId(p._id)
    setName(p.name)
    setPrice(String(p.price))
    setDescription(p.description || '')
    setImageUrl(p.images?.[0] || '')
    setInventory(
      typeof p.inventory === 'number' && !Number.isNaN(p.inventory)
        ? String(p.inventory)
        : '',
    )
    setCategory(p.category || '')
    setError(null)
  }

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this product?')
    if (!ok) return
    try {
      await axios.delete(`/api/products/${id}`)
      if (editingId === id) {
        setEditingId(null)
        setName('')
        setPrice('')
        setDescription('')
        setImageUrl('')
        setInventory('')
        setCategory('')
      }
      loadProducts()
    } catch {
      setError('Failed to delete product.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Menu items
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Add burgers, pizzas, fries, drinks and manage existing items.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Search products…"
            className="w-full sm:w-56 rounded-full border border-slate-200 px-3 py-2 text-sm focus:border-[#FFD400] focus:outline-none focus:ring-1 focus:ring-[#FFD400] bg-white"
            // simple search UI only (no filtering wired yet)
          />
          <button
            type="button"
            className="hidden sm:inline-flex items-center rounded-full bg-[#FFD400] px-4 py-2 text-xs font-semibold text-black hover:bg-[#e6b800]"
            onClick={() => {
              const formTop = document.getElementById('admin-product-form')
              formTop?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            + Add product
          </button>
        </div>
      </div>

      {lastCreated && (
        <div className="rounded-2xl border border-black/10 bg-[#FFF4B8] p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
          <div className="h-16 w-20 overflow-hidden rounded-xl bg-slate-100 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                lastCreated.images?.[0] ||
                'https://via.placeholder.com/200x150.png?text=Product'
              }
              alt={lastCreated.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs font-semibold text-black uppercase tracking-wide">
              Your listing is live
            </p>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              {lastCreated.name}
            </h2>
            <p className="text-xs text-slate-700">
              Added to your menu and visible on the storefront.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-sm font-semibold text-slate-900">
                ${lastCreated.price.toFixed(2)}
              </span>
              {lastCreated.category && (
                <span className="inline-flex items-center rounded-full bg-black text-[#FFD400] px-2 py-0.5 text-[11px] font-medium border border-black/10">
                  {lastCreated.category}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={`/products/${lastCreated._id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#111]"
            >
              View on site
            </a>
            <button
              type="button"
              onClick={() => setLastCreated(null)}
              className="inline-flex items-center rounded-full border border-transparent px-3 py-1.5 text-[11px] text-slate-600 hover:border-slate-300 hover:text-slate-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        id="admin-product-form"
        className="space-y-4 rounded-2xl border border-[#d8eedf] bg-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold text-slate-900">
          Create new product
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#66b07a] focus:outline-none focus:ring-1 focus:ring-[#66b07a]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Price (USD)
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#66b07a] focus:outline-none focus:ring-1 focus:ring-[#66b07a]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Inventory (optional)
            </label>
            <input
              type="number"
              min="0"
              value={inventory}
              onChange={(e) => setInventory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-medium text-slate-700">
                Description (optional)
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 hover:border-[#66b07a] hover:text-[#66b07a]"
              >
                AI generated
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#66b07a] focus:outline-none focus:ring-1 focus:ring-[#66b07a]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Image URL (optional)
            </label>
            <input
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#FFD400] focus:outline-none focus:ring-1 focus:ring-[#FFD400]"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Paste a direct image URL. If you share product pictures, we can
              host them and use those URLs here.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700">
              Category
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:border-[#FFD400] focus:outline-none focus:ring-1 focus:ring-[#FFD400]"
            >
              <option value="">Select a category</option>
              <option value="pizza">Pizza</option>
              <option value="burgers">Burgers</option>
              <option value="fries">Fries &amp; sides</option>
              <option value="drinks">Drinks &amp; shakes</option>
              <option value="combo">Combo meals</option>
            </select>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-[#FFD400] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#e6b800] disabled:opacity-60"
          >
            {submitting
              ? editingId
                ? 'Updating…'
                : 'Creating…'
              : editingId
              ? 'Update product'
              : 'Create product'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setName('')
                setPrice('')
                setDescription('')
                setImageUrl('')
                setInventory('')
                setCategory('')
                setError(null)
              }}
              className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:border-[#FFD400] hover:text-[#FFD400]"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Existing products</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading products…</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-slate-500">
            No products yet. Use the form above to add your first product.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-[#FFF4B8] text-left text-xs font-semibold text-slate-800">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Inventory</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2 hidden sm:table-cell">Image</th>
                  <th className="px-4 py-2">Id</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => (
                  <tr
                    key={p._id}
                    className={`border-t border-slate-100 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    } hover:bg-slate-100/70`}
                  >
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {typeof p.inventory === 'number' ? p.inventory : '—'}
                    </td>
                    <td className="px-4 py-2">
                      {p.category ? (
                    <span className="inline-flex items-center rounded-full bg-[#FFD400]/20 px-2 py-0.5 text-[11px] font-medium text-black">
                          {p.category}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-4 py-2 hidden sm:table-cell">
                      {p.images?.[0] ? (
                        <span className="text-[#66b07a] text-xs">
                          Image set
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-slate-400 max-w-xs truncate">
                      {p._id}
                    </td>
                    <td className="px-4 py-2 space-x-2 text-xs whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-slate-700 hover:border-[#66b07a] hover:text-[#66b07a]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 hover:border-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}


