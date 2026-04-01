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

  // Notification recipients
  const notifEmails = (initialSettings.notification_emails ?? {}) as Record<string, string[]>
  const [recipients, setRecipients] = useState<string[]>(notifEmails.emails ?? [])
  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  function addRecipient() {
    setEmailError('')
    const email = newEmail.trim().toLowerCase()
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email format')
      return
    }
    if (recipients.includes(email)) {
      setEmailError('Email already added')
      return
    }
    setRecipients([...recipients, email])
    setNewEmail('')
  }

  function removeRecipient(email: string) {
    setRecipients(recipients.filter((e) => e !== email))
  }

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

    const emailsPayload = {
      key: 'notification_emails',
      value: { emails: recipients },
      updated_at: new Date().toISOString(),
    }

    const { error: e1 } = await supabase
      .from('settings')
      .upsert(companyPayload, { onConflict: 'key' })

    const { error: e2 } = await supabase
      .from('settings')
      .upsert(notifPayload, { onConflict: 'key' })

    const { error: e3 } = await supabase
      .from('settings')
      .upsert(emailsPayload, { onConflict: 'key' })

    if (e1 || e2 || e3) {
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

      {/* Notification Recipients */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-1">Notification Recipients</h2>
        <p className="text-xs text-neutral-500 mb-4">Email addresses that receive notifications when new submissions arrive.</p>

        {/* Current recipients */}
        {recipients.length > 0 && (
          <div className="space-y-2 mb-4">
            {recipients.map((email) => (
              <div key={email} className="flex items-center justify-between bg-neutral-800 rounded-lg px-3 py-2">
                <span className="text-sm text-neutral-300">{email}</span>
                <button
                  type="button"
                  onClick={() => removeRecipient(email)}
                  className="text-neutral-500 hover:text-red-400 text-xs font-medium transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {recipients.length === 0 && (
          <p className="text-sm text-neutral-600 mb-4">No recipients added yet. Add an email to start receiving notifications.</p>
        )}

        {/* Add new recipient */}
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); setEmailError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(); } }}
            placeholder="email@example.com"
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-600"
          />
          <button
            type="button"
            onClick={addRecipient}
            className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-neutral-200 transition"
          >
            Add
          </button>
        </div>
        {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
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
