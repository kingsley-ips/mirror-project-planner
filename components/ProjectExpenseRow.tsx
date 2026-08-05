import type { ProjectExpense } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toggleExpensePaidAction, updateExpenseInvoiceNumberAction } from '@/app/actions'

export default function ProjectExpenseRow({ projectId, expense }: { projectId: string; expense: ProjectExpense }) {
  const updateInvoiceNumber = updateExpenseInvoiceNumberAction.bind(null, projectId)
  const togglePaid = toggleExpensePaidAction.bind(null, projectId)

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
      <div className="flex items-center gap-3 shrink-0">
        <form action={updateInvoiceNumber} className="flex items-center gap-1">
          <input type="hidden" name="expenseId" value={expense.id} />
          <input
            name="invoiceNumber"
            defaultValue={expense.invoiceNumber ?? ''}
            placeholder="Invoice #"
            className="input text-xs w-24 py-1"
          />
          <Button type="submit" variant="ghost" size="sm">Save</Button>
        </form>
        <form action={togglePaid}>
          <input type="hidden" name="expenseId" value={expense.id} />
          <input type="hidden" name="currentlyPaid" value={expense.invoicePaidDate ? 'true' : 'false'} />
          <Button type="submit" variant={expense.invoicePaidDate ? 'outline' : 'secondary'} size="sm">
            {expense.invoicePaidDate ? `Paid ${expense.invoicePaidDate}` : 'Mark Paid'}
          </Button>
        </form>
        <p className="font-semibold text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatMoney(expense.amount)}
        </p>
      </div>
    </Card>
  )
}
