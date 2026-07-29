import type { LifecycleSummary as LifecycleSummaryType } from '@/lib/types'
import { Card } from '@/components/ui/Card'

function fmtDays(days: number): string {
  return `${days.toFixed(1)} day${days === 1 ? '' : 's'}`
}

export default function LifecycleSummary({ summary }: { summary: LifecycleSummaryType }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs" style={{ color: 'var(--faint)' }}>Days since started</span>
          <p className="text-lg font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {fmtDays(summary.daysSinceStart)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs" style={{ color: 'var(--faint)' }}>Total lifecycle (Sales → Complete)</span>
          <p className="text-lg font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {summary.totalLifecycleDays !== null ? fmtDays(summary.totalLifecycleDays) : 'In progress'}
          </p>
        </div>
      </div>

      <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>Days per stage</h3>
      <div className="flex flex-col gap-1">
        {summary.daysByStage.map(({ stage, days }) => (
          <div key={stage} className="flex items-center justify-between text-sm">
            <span>{stage}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{fmtDays(days)}</span>
          </div>
        ))}
        {summary.daysByStage.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--faint)' }}>No stage history yet.</p>
        )}
      </div>
    </Card>
  )
}
