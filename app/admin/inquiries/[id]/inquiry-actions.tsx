'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { INQUIRY_STATUSES } from '@/lib/constants'

export function InquiryActions({
  inquiryId,
  currentStatus,
  currentAssignedTo,
  currentNotes,
}: {
  inquiryId: string
  currentStatus: string
  currentAssignedTo: string | null
  currentNotes: string | null
}) {
  const [status, setStatus] = useState(currentStatus)
  const [assignedTo, setAssignedTo] = useState(currentAssignedTo ?? '')
  const [notes, setNotes] = useState(currentNotes ?? '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('project_inquiries')
      .update({
        status,
        assigned_to: assignedTo || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiryId)

    if (error) {
      alert('Failed to update inquiry')
    }
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-neutral-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        >
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Assigned To</label>
        <input
          type="text"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          placeholder="Team member name or email"
          className="w-full border border-neutral-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Internal notes..."
          className="w-full border border-neutral-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-neutral-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}
