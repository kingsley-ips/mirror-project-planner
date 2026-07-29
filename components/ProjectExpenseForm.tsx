import Button from '@/components/ui/Button'
import { createProjectExpenseAction } from '@/app/actions'

export default function ProjectExpenseForm({
  projectId,
  vendorSuggestions,
}: {
  projectId: string
  vendorSuggestions: string[]
}) {
  const action = createProjectExpenseAction.bind(null, projectId)

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <label className="flex flex-col gap-1 text-xs flex-1 min-w-[160px]">
        <span style={{ color: 'var(--muted)' }}>Vendor</span>
        <input name="vendorName" required list="vendor-suggestions" className="input" placeholder="e.g. Home Depot" />
        <datalist id="vendor-suggestions">
          {vendorSuggestions.map((v) => <option key={v} value={v} />)}
        </datalist>
      </label>
      <label className="flex flex-col gap-1 text-xs w-32">
        <span style={{ color: 'var(--muted)' }}>Amount</span>
        <input type="number" name="amount" step="0.01" min="0.01" required className="input" />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Invoice date</span>
        <input type="date" name="invoiceDate" className="input" />
      </label>
      <label className="flex flex-col gap-1 text-xs flex-1 min-w-[160px]">
        <span style={{ color: 'var(--muted)' }}>Description</span>
        <input name="description" className="input" placeholder="What was this for?" />
      </label>
      <Button type="submit" size="sm">Log Expense</Button>
    </form>
  )
}
