'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StatusHistory } from '@/lib/types/database'

interface TimelineProps {
  entityType: 'submission' | 'inquiry'
  entityId: string
}

export function Timeline({ entityType, entityId }: TimelineProps) {
  const [entries, setEntries] = useState<StatusHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const supabase = createClient()
      const { data } = await supabase
        .from('status_history')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })

      if (data) setEntries(data)
      setLoading(false)
    }

    fetchHistory()
  }, [entityType, entityId])

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading timeline...</p>
  }

  if (entries.length === 0) {
    return <p className="text-sm text-neutral-500">No status changes recorded.</p>
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative flex gap-3">
          {/* Vertical line */}
          <div className="flex flex-col items-center">
            <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-neutral-500 ring-2 ring-neutral-800" />
            {index < entries.length - 1 && (
              <div className="w-px flex-1 bg-neutral-800" />
            )}
          </div>

          {/* Content */}
          <div className="pb-4">
            <p className="text-sm text-neutral-300">
              Status changed
              {entry.old_status && (
                <> from <span className="font-medium text-neutral-200 capitalize">{entry.old_status.replace('_', ' ')}</span></>
              )}
              {' '}to{' '}
              <span className="font-medium text-white capitalize">{entry.new_status.replace('_', ' ')}</span>
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {new Date(entry.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
