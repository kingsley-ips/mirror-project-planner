import type { Person } from '@/lib/types'
import { TIME_ENTRY_CATEGORIES } from '@/lib/types'
import Button from '@/components/ui/Button'
import { createTimeEntryAction } from '@/app/actions'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function TimeEntryForm({ projectId, people }: { projectId: string; people: Person[] }) {
  const action = createTimeEntryAction.bind(null, projectId)

  if (people.length === 0) {
    return (
      <p className="text-sm p-4 rounded-xl border" style={{ borderColor: 'var(--border)', color: 'var(--faint)' }}>
        No one's assigned to this project yet — add someone to the team above before logging hours.
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <label className="flex flex-col gap-1 text-xs flex-1 min-w-[160px]">
        <span style={{ color: 'var(--muted)' }}>Person</span>
        <select name="personId" required className="input">
          <option value="">Select...</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Date</span>
        <input type="date" name="workDate" required defaultValue={todayIso()} className="input" />
      </label>
      <label className="flex flex-col gap-1 text-xs w-24">
        <span style={{ color: 'var(--muted)' }}>Hours</span>
        <input type="number" name="hours" step="0.25" min="0.25" required className="input" />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Category</span>
        <select name="category" className="input">
          {TIME_ENTRY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs flex-1 min-w-[160px]">
        <span style={{ color: 'var(--muted)' }}>Notes</span>
        <input name="notes" className="input" placeholder="Optional" />
      </label>
      <Button type="submit" size="sm">Log Hours</Button>
    </form>
  )
}
