import type { Person } from '@/lib/types'

export default function AssigneePicker({
  people,
  selectedIds = [],
}: {
  people: Person[]
  selectedIds?: string[]
}) {
  return (
    <div
      className="flex flex-col gap-1 text-xs max-h-28 overflow-y-auto rounded-lg border px-2 py-1.5 min-w-[160px]"
      style={{ borderColor: 'var(--border)' }}
    >
      {people.length === 0 && <span style={{ color: 'var(--faint)' }}>No one added yet</span>}
      {people.map((p) => (
        <label key={p.id} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            name="assigneeIds"
            value={p.id}
            defaultChecked={selectedIds.includes(p.id)}
          />
          <span>{p.name}</span>
        </label>
      ))}
    </div>
  )
}
