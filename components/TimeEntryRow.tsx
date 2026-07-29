import type { TimeEntry } from '@/lib/types'
import { Card } from '@/components/ui/Card'

export default function TimeEntryRow({ entry }: { entry: TimeEntry }) {
  return (
    <Card padded className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">{entry.person.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--faint)' }}>
          {entry.workDate} · {entry.category}
          {entry.notes ? ` · ${entry.notes}` : ''}
        </p>
      </div>
      <p className="font-semibold text-sm shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {entry.hours.toFixed(2)} hrs
      </p>
    </Card>
  )
}
