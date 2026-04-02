import { cn } from '@/lib/utils'
import { PRIORITY_COLORS } from '@/lib/constants'

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
        PRIORITY_COLORS[priority] || 'bg-neutral-800 text-neutral-400'
      )}
    >
      {priority}
    </span>
  )
}
