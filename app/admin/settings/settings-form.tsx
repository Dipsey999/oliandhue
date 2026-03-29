'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SettingsFormProps {
  initialSettings: Record<string, Record<string, unknown>>
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Company info
  const company = (initialSettings.company_info ?? {}) as Record<string, string>
  const [companyName, setCompanyName] = useState(company.name ?? '')
  const [companyEmail, setCompanyEmail] = useState(company.email ?? '')
  const [companyPhone, setCompanyPhone] = useState(company.phone ?? '')
  const [companyAddress, setCompanyAddress] = useState(company.address ?? '')

  // Notification preferences
  const notifications = (initialSettings.notifications ?? {}) as Record<string, boolean>
  const [emailOnSubmission, setEmailOnSubmission] = useState(notifications.email_on_submission ?? true)
  const [emailOnInquiry, setEmailOnInquiry] = useState(notifications.email_on_inquiry ?? true)
  const [emailOnSubscriber, setEmailOnSubscriber] = useState(notifications.email_on_subscriber ?? false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const companyPayload = {
      key: 'company_info',
      value: {
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
      },
      updated_at: new Date().toISOString(),
    }

    const notifPayload = {
      key: 'notifications',
      value: {
        email_on_submission: emailOnSubmission,
        email_on_inquiry: emailOnInquiry,
        email_on_subscriber: emailOnSubscriber,
      },
      updated_at: new Date().toISOString(),
    }

    const { error: e1 } = await supabase
      .from('settings')
      .upsert(companyPayload, { onConflict: 'key' })

    const { error: e2 } = await supabase
      .from('settings')
      .upsert(notifPayload, { onConflict: 'key' })

    if (e1 || e2) {
      setMessage('Failed to save settings')
    } else {
      setMessage('Settings saved successfully')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
      {/* Company Info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Company Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Phone</label>
            <input
              type="text"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Address</label>
            <textarea
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              rows={2}
              className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Notification Preferences</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailOnSubmission}
              onChange={(e) => setEmailOnSubmission(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 text-white focus:ring-neutral-900"
            />
            <div>
              <p className="text-sm text-white">New contact submissions</p>
              <p className="text-xs text-neutral-500">Email notification when someone submits the contact form</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailOnInquiry}
              onChange={(e) => setEmailOnInquiry(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 text-white focus:ring-neutral-900"
            />
            <div>
              <p className="text-sm text-white">New project inquiries</p>
              <p className="text-xs text-neutral-500">Email notification when someone submits a project inquiry</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailOnSubscriber}
              onChange={(e) => setEmailOnSubscriber(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 text-white focus:ring-neutral-900"
            />
            <div>
              <p className="text-sm text-white">New newsletter subscribers</p>
              <p className="text-xs text-neutral-500">Email notification when someone subscribes to the newsletter</p>
            </div>
          </label>
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-neutral-900 text-white text-sm font-medium py-2 px-6 rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  )
}
