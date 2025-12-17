'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { saveToken, getCurrentUser } from '../../../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { email, password })
      if (res.data?.token) {
        saveToken(res.data.token)
        setSuccess('Logged in successfully')
        setTimeout(() => setSuccess(null), 2500)
        const from = searchParams?.get('from')
        const user = getCurrentUser()

        if (from === 'checkout') {
          router.push('/checkout')
        } else if (from === 'admin' || user?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        setError('Invalid response from server.')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Login failed. Please check your details and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-600">
          Access your general store account to view orders and checkout faster.
        </p>
      </div>
      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
      >
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        {error && (
          <p className="text-xs text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-xs text-slate-600 text-center">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-emerald-600 hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </section>
  )
}


