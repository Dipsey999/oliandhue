import { cn } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/constants'

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
        STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
      )}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
