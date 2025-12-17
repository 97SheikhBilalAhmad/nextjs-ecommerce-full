'use client'

import { useEffect, useState } from 'react'
import type React from 'react'
import { getToken } from '@/lib/auth'

type FormState = {
  fullName: string
  adminEmail: string
  adminPhone: string
  storeName: string
  supportEmail: string
  supportPhone: string
  address: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  useBoldPhotos: boolean
  roundedUI: boolean
  notifyOrderConfirmations: boolean
  notifyLowStock: boolean
  notifyWeeklySummary: boolean
  stripePublicKey: string
  stripeSecretKey: string
  logoUrl: string
}

const emptyState: FormState = {
  fullName: 'Golden Feast Admin',
  adminEmail: 'admin@gmail.com',
  adminPhone: '+1 (555) 123-4567',
  storeName: 'Golden Feast',
  supportEmail: 'support@goldenfeast.com',
  supportPhone: '+1 (555) 987-6543',
  address: '123 Food Street, Flavor Town',
  primaryColor: '#FFCC00',
  secondaryColor: '#000000',
  accentColor: '#FFFFFF',
  useBoldPhotos: true,
  roundedUI: true,
  notifyOrderConfirmations: true,
  notifyLowStock: true,
  notifyWeeklySummary: false,
  stripePublicKey: '',
  stripeSecretKey: '',
  logoUrl: '',
}

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#FFCC00] focus:outline-none focus:ring-1 focus:ring-[#FFCC00] ${props.className || ''}`}
  />
)

const Toggle = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
}) => (
  <label className="flex items-start gap-3 rounded-lg border border-black/5 bg-white px-3 py-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#FFCC00] focus:ring-[#FFCC00]"
    />
    <div className="space-y-0.5">
      <span className="text-sm font-medium text-slate-900">{label}</span>
      {description ? (
        <p className="text-xs text-slate-600">{description}</p>
      ) : null}
    </div>
  </label>
)

export default function SettingsPage() {
  const [form, setForm] = useState<FormState>(emptyState)
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const token = getToken()
      const res = await fetch('/api/settings', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) return
      const data = await res.json()
      const s = data?.settings || {}
      setForm((prev) => ({
        ...prev,
        ...s,
        fullName: s.fullName ?? prev.fullName,
        adminEmail: s.adminEmail ?? prev.adminEmail,
        adminPhone: s.adminPhone ?? prev.adminPhone,
        storeName: s.storeName ?? prev.storeName,
        supportEmail: s.supportEmail ?? prev.supportEmail,
        supportPhone: s.supportPhone ?? prev.supportPhone,
        address: s.address ?? prev.address,
        primaryColor: s.primaryColor ?? prev.primaryColor,
        secondaryColor: s.secondaryColor ?? prev.secondaryColor,
        accentColor: s.accentColor ?? prev.accentColor,
        useBoldPhotos:
          typeof s.useBoldPhotos === 'boolean' ? s.useBoldPhotos : prev.useBoldPhotos,
        roundedUI: typeof s.roundedUI === 'boolean' ? s.roundedUI : prev.roundedUI,
        notifyOrderConfirmations:
          typeof s.notifyOrderConfirmations === 'boolean'
            ? s.notifyOrderConfirmations
            : prev.notifyOrderConfirmations,
        notifyLowStock:
          typeof s.notifyLowStock === 'boolean' ? s.notifyLowStock : prev.notifyLowStock,
        notifyWeeklySummary:
          typeof s.notifyWeeklySummary === 'boolean'
            ? s.notifyWeeklySummary
            : prev.notifyWeeklySummary,
        stripePublicKey: s.stripePublicKey ?? prev.stripePublicKey,
        stripeSecretKey: s.stripeSecretKey ?? prev.stripeSecretKey,
        logoUrl: s.logoUrl ?? prev.logoUrl,
      }))
    } catch (err) {
      console.error('Failed to load settings', err)
    }
  }

  const updateField = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result?.toString() || ''
      updateField('logoUrl', result)
    }
    reader.readAsDataURL(file)
  }

  const saveSettings = async () => {
    setMessage(null)
    const token = getToken()
    if (!token) {
      window.alert('Please login as admin to save settings.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save settings')
      const data = await res.json()
      const s = data?.settings || {}
      setForm((prev) => ({ ...prev, ...s }))
      setMessage('Settings saved')
    } catch (err) {
      console.error(err)
      setMessage('Could not save settings')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    setMessage(null)
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setMessage('Please fill all password fields')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setMessage('New passwords do not match')
      return
    }
    const token = getToken()
    if (!token) {
      window.alert('Please login as admin to change password.')
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.next,
        }),
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Failed')
      }
      setMessage('Password updated')
      setPasswordForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      console.error(err)
      setMessage('Could not update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#FFCC00]">Settings</p>
          <h1 className="text-2xl font-bold text-slate-900">
            Admin & store settings
          </h1>
          <p className="text-sm text-slate-600">
            Profile, password, store info, notifications, and theme controls.
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={loading}
          className="inline-flex items-center rounded-full bg-[#FFCC00] px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#e6b800] disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {message ? (
        <div className="rounded-lg border border-black/5 bg-white px-3 py-2 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Profile settings"
          description="Admin contact details for receipts and alerts."
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Full name
              </label>
              <Input
                placeholder="Golden Feast Admin"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Email
              </label>
              <Input
                placeholder="admin@gmail.com"
                type="email"
                value={form.adminEmail}
                onChange={(e) => updateField('adminEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Phone
              </label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={form.adminPhone}
                onChange={(e) => updateField('adminPhone', e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card
          title="Change password"
          description="Keep your admin account secure."
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Current password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordForm.current}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, current: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                New password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordForm.next}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, next: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Confirm new password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))
                }
              />
            </div>
            <button
              onClick={handlePasswordUpdate}
              disabled={passwordLoading}
              className="w-full rounded-lg bg-black text-[#FFCC00] px-3 py-2 text-sm font-semibold hover:bg-[#111] disabled:opacity-60"
            >
              {passwordLoading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </Card>

        <Card
          title="Store information"
          description="What customers see on the storefront."
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Store name
              </label>
              <Input
                placeholder="Golden Feast"
                value={form.storeName}
                onChange={(e) => updateField('storeName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Support email
              </label>
              <Input
                placeholder="support@goldenfeast.com"
                type="email"
                value={form.supportEmail}
                onChange={(e) => updateField('supportEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Support phone
              </label>
              <Input
                placeholder="+1 (555) 987-6543"
                value={form.supportPhone}
                onChange={(e) => updateField('supportPhone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Address
              </label>
              <Input
                placeholder="123 Food Street, Flavor Town"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Restaurant logo
              </label>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#FFF4B8] border border-[#FFCC00]/40 overflow-hidden flex items-center justify-center text-sm font-semibold text-black">
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.logoUrl}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    'Logo'
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#FFD400] file:px-3 file:py-1 file:text-sm file:font-semibold file:text-black hover:file:bg-[#e6b800]"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Upload a square logo (PNG/SVG). It will appear in the navbar and admin header.
              </p>
            </div>
          </div>
        </Card>

        <Card
          title="Theme settings"
          description="Control the fast-food look across admin and storefront."
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Primary color
                </label>
                <Input
                  placeholder="#FFCC00"
                  value={form.primaryColor}
                  onChange={(e) => updateField('primaryColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Secondary color
                </label>
                <Input
                  placeholder="#000000"
                  value={form.secondaryColor}
                  onChange={(e) => updateField('secondaryColor', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Accent color
                </label>
                <Input
                  placeholder="#FFFFFF"
                  value={form.accentColor}
                  onChange={(e) => updateField('accentColor', e.target.value)}
                />
              </div>
            </div>
            <Toggle
              label="Use bold food photography"
              description="Apply hero/menu imagery prominently."
              checked={form.useBoldPhotos}
              onChange={(v) => updateField('useBoldPhotos', v)}
            />
            <Toggle
              label="Rounded buttons & cards"
              description="Keep the playful fast-food feel."
              checked={form.roundedUI}
              onChange={(v) => updateField('roundedUI', v)}
            />
          </div>
        </Card>

        <Card
          title="Notifications"
          description="Control emails and alerts for orders and stock."
        >
          <div className="space-y-3">
            <Toggle
              label="Order confirmations"
              description="Send an email when an order is placed."
              checked={form.notifyOrderConfirmations}
              onChange={(v) => updateField('notifyOrderConfirmations', v)}
            />
            <Toggle
              label="Low stock alerts"
              description="Notify when inventory drops below threshold."
              checked={form.notifyLowStock}
              onChange={(v) => updateField('notifyLowStock', v)}
            />
            <Toggle
              label="Weekly summary"
              description="Email a weekly dashboard summary."
              checked={form.notifyWeeklySummary}
              onChange={(v) => updateField('notifyWeeklySummary', v)}
            />
          </div>
        </Card>

        <Card
          title="Payment & billing"
          description="Manage connected payment providers and invoices."
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Stripe public key
              </label>
              <Input
                placeholder="pk_live_..."
                value={form.stripePublicKey}
                onChange={(e) => updateField('stripePublicKey', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Stripe secret key
              </label>
              <Input
                placeholder="sk_live_..."
                value={form.stripeSecretKey}
                onChange={(e) => updateField('stripeSecretKey', e.target.value)}
              />
            </div>
            <div className="rounded-lg border border-black/5 bg-[#FFF4B8] px-3 py-2 text-xs text-slate-800">
              Payments are active. Next payout: Monday.
            </div>
          </div>
        </Card>

        <Card
          title="Danger zone"
          description="Actions that can affect your store data."
        >
          <div className="space-y-3">
            <button className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold text-black hover:border-black/30">
              Export data
            </button>
            <button className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:border-red-300">
              Pause store
            </button>
          </div>
        </Card>
      </div>
    </section>
  )
}

function Card({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm space-y-2">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="text-xs text-slate-600">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  )
}