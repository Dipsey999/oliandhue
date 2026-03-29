'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Download, Trash2 } from 'lucide-react'
import Papa from 'papaparse'
import type { NewsletterSubscriber } from '@/lib/types/database'

export function SubscriberActions({ subscribers }: { subscribers: NewsletterSubscriber[] }) {
  function handleExport() {
    const csv = Papa.unparse(
      subscribers.map((s) => ({
        email: s.email,
        source: s.source,
        subscribed_at: s.subscribed_at,
      }))
    )
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-neutral-800 transition"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  )
}

export function DeleteSubscriberButton({ subscriberId, email }: { subscriberId: string; email: string }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm(`Remove ${email} from subscribers?`)) return
    setDeleting(true)
    await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('id', subscriberId)
    setDeleting(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-neutral-400 hover:text-red-500 transition disabled:opacity-50"
      title="Unsubscribe"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
