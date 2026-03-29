import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <Icon className="w-4 h-4 text-neutral-400" />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {description && (
        <p className="text-xs text-neutral-500 mt-1">{description}</p>
      )}
    </div>
  )
}
