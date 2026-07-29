import Link from 'next/link'
import { isTaskBlocked, type Person, type Project, type SlaStatus, type Task } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { SlaBadge } from '@/components/ui/SlaStatus'
import TaskStatusForm from '@/components/TaskStatusForm'

export default function MyTaskRow({
  task,
  project,
  slaStatus,
  viewingAs,
}: {
  task: Task
  project: Project
  slaStatus: SlaStatus
  viewingAs: Person
}) {
  const others = task.assignees.filter((p) => p.id !== viewingAs.id)
  const blocked = isTaskBlocked(task) && task.status !== 'done'

  return (
    <Card padded className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">{task.title}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--faint)' }}>
          <Link href={`/projects/${project.id}`} className="hover:underline" style={{ color: 'var(--pine)' }}>
            {project.name}
          </Link>
          {' · '}{task.category}
          {task.dueDate ? ` · Due ${task.dueDate}` : ''}
          {others.length > 0 ? ` · with ${others.map((p) => p.name).join(', ')}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <SlaBadge status={slaStatus} />
        {blocked ? (
          <span
            className="text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap"
            style={{ backgroundColor: 'var(--border-subtle)', color: 'var(--muted)' }}
          >
            Blocked
          </span>
        ) : (
          <TaskStatusForm projectId={project.id} taskId={task.id} status={task.status} />
        )}
      </div>
    </Card>
  )
}
