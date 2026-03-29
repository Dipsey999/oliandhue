'use client'

import type { Profile } from '@/lib/types/database'

export function Topbar({ user, title }: { user: Profile | null; title?: string }) {
  return (
    <header className="h-14 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-white">{user?.full_name || user?.email}</p>
          <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-semibold">
          {(user?.full_name || user?.email || '?')[0].toUpperCase()}
        </div>
      </div>
    </header>
  )
}
