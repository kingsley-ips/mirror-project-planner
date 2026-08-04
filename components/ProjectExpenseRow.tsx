import type { ProjectExpense } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { Card } from '@/components/ui/Card'

export default function ProjectExpenseRow({ expense }: { expense: ProjectExpense }) {
  return (
    <Card padded className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">{expense.vendor.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--faint)' }}>
          {expense.description || 'No description'}
          {expense.invoiceDate ? ` · ${expense.invoiceDate}` : ''}
          {expense.loggedBy ? ` · logged by ${expense.loggedBy.name}` : ''}
        </p>
      </div>
      <p className="font-semibold text-sm shrink-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatMoney(expense.amount)}
      </p>
    </Card>
  )
}
