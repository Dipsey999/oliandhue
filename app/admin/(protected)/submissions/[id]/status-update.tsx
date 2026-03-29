'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SUBMISSION_STATUSES } from '@/lib/constants'

export function StatusUpdate({
  submissionId,
  currentStatus,
}: {
  submissionId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleUpdate(newStatus: string) {
    setSaving(true)
    setStatus(newStatus)
    const { error } = await supabase
      .from('contact_submissions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', submissionId)

    if (error) {
      setStatus(currentStatus)
      alert('Failed to update status')
    }
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <select
        value={status}
        onChange={(e) => handleUpdate(e.target.value)}
        disabled={saving}
        className="border border-neutral-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50"
      >
        {SUBMISSION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace('_', ' ')}
          </option>
        ))}
      </select>
      {saving && <span className="text-xs text-neutral-500">Saving...</span>}
    </div>
  )
}
