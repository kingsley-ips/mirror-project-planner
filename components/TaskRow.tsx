'use client'

import { useState } from 'react'
import { formatDueTime, isTaskBlocked, type Person, type SlaStatus, type Task } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SlaBadge } from '@/components/ui/SlaStatus'
import TaskStatusForm from '@/components/TaskStatusForm'
import AssigneePicker from '@/components/AssigneePicker'
import NewTaskForm from '@/components/NewTaskForm'
import { updateTaskAction } from '@/app/actions'

const TASK_CATEGORIES = [
  'Pre Design', 'Design', 'Job Logistics', 'Material Logistics', 'Construction', 'Project Closeout',
] as const

interface SubtaskEntry {
  task: Task
  slaStatus: SlaStatus
}

export default function TaskRow({
  projectId,
  task,
  slaStatus,
  people,
  subtasks = [],
  isSubtask = false,
}: {
  projectId: string
  task: Task
  slaStatus: SlaStatus
  people: Person[]
  subtasks?: SubtaskEntry[]
  isSubtask?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [addingSubtask, setAddingSubtask] = useState(false)
  const action = updateTaskAction.bind(null, projectId, task.id)
  const blocked = isTaskBlocked(task) && task.status !== 'done'

  if (editing) {
    return (
      <Card padded>
        <form
          action={async (formData) => {
            await action(formData)
            setEditing(false)
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <label className="flex flex-col gap-1 text-xs flex-1 min-w-[160px]">
            <span style={{ color: 'var(--muted)' }}>Task</span>
            <input name="title" defaultValue={task.title} required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span style={{ color: 'var(--muted)' }}>Category</span>
            <select name="category" defaultValue={task.category} className="input">
              {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span style={{ color: 'var(--muted)' }}>Owners</span>
            <AssigneePicker people={people} selectedIds={task.assignees.map((p) => p.id)} />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span style={{ color: 'var(--muted)' }}>Due date</span>
            <input type="date" name="dueDate" defaultValue={task.dueDate ?? ''} className="input" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span style={{ color: 'var(--muted)' }}>Due time</span>
            <input type="time" name="dueTime" defaultValue={task.dueTime ?? ''} className="input" />
          </label>
          <label className="flex flex-col gap-1 text-xs w-24">
            <span style={{ color: 'var(--muted)' }}>SLA (days)</span>
            <input type="number" name="slaDays" min="0" defaultValue={task.slaDays ?? ''} className="input" />
          </label>
          <Button type="submit" size="sm">Save</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
        </form>
      </Card>
    )
  }

  const assigneeText = task.assignees.length > 0
    ? task.assignees.map((p) => p.name).join(', ')
    : 'Unassigned'

  return (
    <div className={isSubtask ? 'ml-6' : ''}>
      <Card padded className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-sm">{task.title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--faint)' }}>
            {task.category} · {assigneeText}
            {task.dueDate ? ` · Due ${task.dueDate}${task.dueTime ? ` at ${formatDueTime(task.dueTime)}` : ''}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <SlaBadge status={slaStatus} />
          {blocked ? (
            <span
              className="text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap"
              style={{ backgroundColor: 'var(--border-subtle)', color: 'var(--muted)' }}
            >
              Blocked ({task.incompleteSubtaskCount} subtask{task.incompleteSubtaskCount === 1 ? '' : 's'} left)
            </span>
          ) : (
            <TaskStatusForm projectId={projectId} taskId={task.id} status={task.status} />
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          {!isSubtask && (
            <Button variant="ghost" size="sm" onClick={() => setAddingSubtask((v) => !v)}>
              + Subtask
            </Button>
          )}
        </div>
      </Card>

      {subtasks.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {subtasks.map(({ task: subtask, slaStatus: subtaskSla }) => (
            <TaskRow
              key={subtask.id}
              projectId={projectId}
              task={subtask}
              slaStatus={subtaskSla}
              people={people}
              isSubtask
            />
          ))}
        </div>
      )}

      {addingSubtask && !isSubtask && (
        <div className="ml-6 mt-2">
          <NewTaskForm
            projectId={projectId}
            people={people}
            parentTaskId={task.id}
            label="Subtask"
            placeholder="e.g. Verify materials"
          />
        </div>
      )}
    </div>
  )
}
