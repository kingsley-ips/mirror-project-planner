import type { BudgetSummary as BudgetSummaryType } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { Card } from '@/components/ui/Card'

export default function BudgetSummary({ summary }: { summary: BudgetSummaryType }) {
  const overBudget = summary.variance > 0
  const varianceColor = overBudget ? 'var(--status-overdue-text)' : 'var(--status-ontrack-text)'
  const varianceBg = overBudget ? 'var(--status-overdue-bg)' : 'var(--status-ontrack-bg)'

  return (
    <Card>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span style={{ color: 'var(--faint)' }}>Total Sold</span>
          <p className="text-lg font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(summary.totalSold)}
          </p>
        </div>
        <div>
          <span style={{ color: 'var(--faint)' }}>Total Actual</span>
          <p className="text-lg font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(summary.totalActual)}
          </p>
          <p className="text-xs" style={{ color: 'var(--faint)' }}>
            (incl. {formatMoney(summary.totalExpenses)} in logged expenses)
          </p>
        </div>
        <div>
          <span style={{ color: 'var(--faint)' }}>Variance</span>
          <p
            className="text-lg font-semibold inline-block px-2 py-0.5 rounded-lg"
            style={{ fontVariantNumeric: 'tabular-nums', color: varianceColor, backgroundColor: varianceBg }}
          >
            {overBudget ? '+' : ''}{formatMoney(summary.variance)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--faint)' }}>
            {overBudget ? 'Over budget' : 'On or under budget'}
          </p>
        </div>
      </div>
    </Card>
  )
}
