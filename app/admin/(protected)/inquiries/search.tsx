'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export function InquiriesSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    router.push(`/admin/inquiries?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2 border border-neutral-800 rounded-lg text-sm bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:border-transparent"
        />
      </div>
    </form>
  )
}
