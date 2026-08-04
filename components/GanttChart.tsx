import type { Project, SlaStatus, Task, TaskCategory } from '@/lib/types'

const CATEGORY_ORDER: TaskCategory[] = [
  'Pre Design', 'Design', 'Job Logistics', 'Material Logistics', 'Construction', 'Project Closeout',
]

const DOT_COLOR: Record<SlaStatus, string> = {
  ontrack: 'var(--status-ontrack-dot)',
  atrisk: 'var(--status-atrisk-dot)',
  overdue: 'var(--status-overdue-dot)',
  done: 'var(--faint)',
}

interface GanttRow {
  task: Task
  slaStatus: SlaStatus
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ReferenceLines({ soldPct, installPct }: { soldPct: number | null; installPct: number | null }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {soldPct !== null && (
        <div className="absolute top-0 bottom-0 border-l" style={{ left: `${soldPct}%`, borderColor: 'var(--bluestem)' }} />
      )}
      {installPct !== null && (
        <div className="absolute top-0 bottom-0 border-l" style={{ left: `${installPct}%`, borderColor: 'var(--pine)' }} />
      )}
    </div>
  )
}

export default function GanttChart({ project, rows }: { project: Project; rows: GanttRow[] }) {
  const dates: number[] = []
  if (project.soldInstallDate) dates.push(new Date(project.soldInstallDate).getTime())
  if (project.projectedInstallDate) dates.push(new Date(project.projectedInstallDate).getTime())
  for (const { task } of rows) {
    if (task.dueDate) dates.push(new Date(task.dueDate).getTime())
  }

  if (dates.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--faint)' }}>
        No dates set yet — add a sold or projected install date, or task due dates, to see a timeline.
      </p>
    )
  }

  const dayMs = 24 * 60 * 60 * 1000
  const min = Math.min(...dates) - 3 * dayMs
  const max = Math.max(...dates) + 3 * dayMs
  const range = max - min

  const pct = (iso: string) => ((new Date(iso).getTime() - min) / range) * 100
  const soldPct = project.soldInstallDate ? pct(project.soldInstallDate) : null
  const installPct = project.projectedInstallDate ? pct(project.projectedInstallDate) : null

  const byCategory = new Map<TaskCategory, GanttRow[]>()
  for (const row of rows) {
    const list = byCategory.get(row.task.category) ?? []
    list.push(row)
    byCategory.set(row.task.category, list)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
        <span>{new Date(min).toLocaleDateString()}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 border-t-2" style={{ borderColor: 'var(--bluestem)' }} /> Sold Install Date</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 border-t-2" style={{ borderColor: 'var(--pine)' }} /> Projected Install Date</span>
        <span className="ml-auto">{new Date(max).toLocaleDateString()}</span>
      </div>

      {CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((category) => (
        <div key={category}>
          <h3 className="text-xs font-semibold mb-1" style={{ color: 'var(--muted)' }}>{category}</h3>
          <div className="grid" style={{ gridTemplateColumns: '220px 1fr' }}>
            {byCategory.get(category)!.map(({ task, slaStatus }) => (
              <div key={task.id} className="contents">
                <div className="text-sm py-2 pr-3" title={task.title}>
                  <div className="truncate">{task.title}</div>
                  <div className="text-xs" style={{ color: 'var(--faint)' }}>
                    {task.dueDate ? formatDate(task.dueDate) : 'No date'}
                  </div>
                </div>
                <div className="relative py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <ReferenceLines soldPct={soldPct} installPct={installPct} />
                  {task.dueDate && (
                    <div
                      className="absolute flex items-center gap-1.5 -translate-x-1/2"
                      style={{ left: `${pct(task.dueDate)}%`, top: '50%', marginTop: '-6px' }}
                      title={`${task.title}: ${task.dueDate}`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: DOT_COLOR[slaStatus] }} />
                      <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>{formatDate(task.dueDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
