import type { Person } from '@/lib/types'
import Button from '@/components/ui/Button'
import AssigneePicker from '@/components/AssigneePicker'
import { createTaskAction } from '@/app/actions'

const TASK_CATEGORIES = [
  'Pre Design', 'Design', 'Job Logistics', 'Material Logistics', 'Construction', 'Project Closeout',
] as const

export default function NewTaskForm({
  projectId,
  people,
  parentTaskId,
  label = 'Task',
  placeholder = 'e.g. Site Audit Complete',
}: {
  projectId: string
  people: Person[]
  parentTaskId?: string
  label?: string
  placeholder?: string
}) {
  const action = createTaskAction.bind(null, projectId)

  return (
    <form action={action} className="flex flex-wrap items-end gap-2 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      {parentTaskId && <input type="hidden" name="parentTaskId" value={parentTaskId} />}
      <label className="flex flex-col gap-1 text-xs flex-1 min-w-[160px]">
        <span style={{ color: 'var(--muted)' }}>{label}</span>
        <input name="title" required className="input" placeholder={placeholder} />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Category</span>
        <select name="category" className="input">
          {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Owners</span>
        <AssigneePicker people={people} />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Due date</span>
        <input type="date" name="dueDate" className="input" />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Due time</span>
        <input type="time" name="dueTime" className="input" />
      </label>
      <label className="flex flex-col gap-1 text-xs w-24">
        <span style={{ color: 'var(--muted)' }}>SLA (days)</span>
        <input type="number" name="slaDays" min="0" className="input" />
      </label>
      <Button type="submit" size="sm">{parentTaskId ? 'Add Subtask' : 'Add Task'}</Button>
    </form>
  )
}
