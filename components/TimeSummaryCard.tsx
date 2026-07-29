import type { TimeSummary } from '@/lib/types'
import { Card } from '@/components/ui/Card'

function fmt(hours: number): string {
  return `${hours.toFixed(2)} hrs`
}

export default function TimeSummaryCard({ summary }: { summary: TimeSummary }) {
  return (
    <Card>
      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <span style={{ color: 'var(--faint)' }}>Install Total</span>
          <p className="text-lg font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(summary.installTotalHours)}</p>
        </div>
        <div>
          <span style={{ color: 'var(--faint)' }}>Electrical Total</span>
          <p className="text-lg font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(summary.electricalTotalHours)}</p>
        </div>
        <div>
          <span style={{ color: 'var(--faint)' }}>Project Total</span>
          <p className="text-lg font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(summary.totalHours)}</p>
        </div>
      </div>

      {summary.byPerson.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>By person</h3>
          <div className="flex flex-col gap-1">
            {summary.byPerson.map(({ person, hours }) => (
              <div key={person.id} className="flex items-center justify-between text-sm">
                <span>{person.name}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{fmt(hours)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
