import Link from 'next/link'
import type { Vendor } from '@/lib/types'
import Button from '@/components/ui/Button'
import { createProjectExpenseAction } from '@/app/actions'

export default function ProjectExpenseForm({
  projectId,
  vendors,
}: {
  projectId: string
  vendors: Vendor[]
}) {
  const action = createProjectExpenseAction.bind(null, projectId)

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <label className="flex flex-col gap-1 text-xs flex-1 min-w-[160px]">
        <span style={{ color: 'var(--muted)' }}>Vendor</span>
        <select name="vendorId" required className="input">
          <option value="">Select...</option>
          {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
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
      {vendors.length === 0 && (
        <p className="text-xs w-full" style={{ color: 'var(--faint)' }}>
          No vendors yet — <Link href="/vendors" className="hover:underline" style={{ color: 'var(--pine)' }}>add one first</Link>.
        </p>
      )}
    </form>
  )
}
