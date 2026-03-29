'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROLES } from '@/lib/constants'

export function InviteMemberForm() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('member')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })

      if (!res.ok) {
        const data = await res.json()
        setMessage(data.error || 'Failed to send invite')
      } else {
        setMessage('Invite sent successfully')
        setEmail('')
        setRole('member')
        router.refresh()
      }
    } catch {
      setMessage('Failed to send invite')
    }

    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="colleague@example.com"
          className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-neutral-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <p className={`text-xs ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-neutral-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
      >
        {saving ? 'Sending...' : 'Send Invite'}
      </button>
    </form>
  )
}
