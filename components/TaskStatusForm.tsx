import type { TaskStatus } from '@/lib/types'
import Button from '@/components/ui/Button'
import { updateTaskStatusAction } from '@/app/actions'

const nextStatus: Record<TaskStatus, TaskStatus> = {
  not_started: 'in_progress',
  in_progress: 'done',
  done: 'not_started',
}

const nextLabel: Record<TaskStatus, string> = {
  not_started: 'Start',
  in_progress: 'Mark Done',
  done: 'Reopen',
}

export default function TaskStatusForm({
  projectId,
  taskId,
  status,
}: {
  projectId: string
  taskId: string
  status: TaskStatus
}) {
  const action = updateTaskStatusAction.bind(null, projectId)
  return (
    <form action={action}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="status" value={nextStatus[status]} />
      <Button type="submit" variant={status === 'done' ? 'outline' : 'secondary'} size="sm">
        {nextLabel[status]}
      </Button>
    </form>
  )
}
