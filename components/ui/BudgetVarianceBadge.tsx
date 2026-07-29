import { formatMoney } from '@/lib/format'

export default function BudgetVarianceBadge({ variance }: { variance: number }) {
  const overBudget = variance > 0
  const style = overBudget
    ? { backgroundColor: 'var(--status-overdue-bg)', color: 'var(--status-overdue-text)' }
    : { backgroundColor: 'var(--status-ontrack-bg)', color: 'var(--status-ontrack-text)' }

  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={style}>
      {overBudget ? '+' : ''}{formatMoney(variance)} {overBudget ? 'over' : 'under'}
    </span>
  )
}
