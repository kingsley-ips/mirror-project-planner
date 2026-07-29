import type { SlaStatus, Task } from './types'

const AT_RISK_WINDOW_DAYS = 2

export function getSlaStatus(task: Task, today: Date): SlaStatus {
  if (task.status === 'done') return 'done'
  if (!task.dueDate) return 'ontrack'

  const due = new Date(task.dueDate)
  const msPerDay = 1000 * 60 * 60 * 24
  const daysUntilDue = Math.floor((due.getTime() - today.getTime()) / msPerDay)

  if (daysUntilDue < 0) return 'overdue'
  if (daysUntilDue <= AT_RISK_WINDOW_DAYS) return 'atrisk'
  return 'ontrack'
}

export function getProjectSlaStatus(taskStatuses: SlaStatus[]): SlaStatus {
  if (taskStatuses.includes('overdue')) return 'overdue'
  if (taskStatuses.includes('atrisk')) return 'atrisk'
  if (taskStatuses.every((s) => s === 'done')) return 'done'
  return 'ontrack'
}
