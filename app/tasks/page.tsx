import Header from '@/components/Header'
import WorkloadTaskRow from '@/components/WorkloadTaskRow'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { getAllTasksFlat, getPeople } from '@/lib/db'
import { getSlaStatus } from '@/lib/sla'
import type { TaskStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; person?: string }>
}) {
  const { status, person: personFilter } = await searchParams

  const [all, people] = await Promise.all([getAllTasksFlat(), getPeople()])
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const withStatus = all.map((t) => ({ ...t, slaStatus: getSlaStatus(t.task, today) }))

  // Capacity summary: how many open/at-risk/overdue tasks land on each
  // person right now, so it's obvious at a glance who's overloaded or
  // who's a bottleneck. A task with multiple assignees counts toward each.
  const capacity = people.map((p) => {
    const mine = withStatus.filter((t) => t.task.status !== 'done' && t.task.assignees.some((a) => a.id === p.id))
    return {
      person: p,
      open: mine.length,
      overdue: mine.filter((t) => t.slaStatus === 'overdue').length,
      atrisk: mine.filter((t) => t.slaStatus === 'atrisk').length,
    }
  })
  const unassignedOpen = withStatus.filter((t) => t.task.status !== 'done' && t.task.assignees.length === 0)

  const filtered = withStatus.filter((t) => {
    if (status && status !== 'all' && t.task.status !== status) return false
    if (personFilter === 'unassigned' && t.task.assignees.length > 0) return false
    if (personFilter && personFilter !== 'all' && personFilter !== 'unassigned') {
      if (!t.task.assignees.some((a) => a.id === personFilter)) return false
    }
    return true
  })

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">All Tasks</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Everyone's workload across every project, in one place.
          </p>
        </div>

        <Card className="mb-6">
          <h2 className="text-sm font-semibold mb-3">Capacity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--faint)' }} className="text-left text-xs">
                  <th className="pb-2 font-medium">Person</th>
                  <th className="pb-2 font-medium">Open</th>
                  <th className="pb-2 font-medium">At risk</th>
                  <th className="pb-2 font-medium">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {capacity.map((row) => (
                  <tr key={row.person.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td className="py-1.5">{row.person.name}</td>
                    <td className="py-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.open}</td>
                    <td className="py-1.5" style={{ fontVariantNumeric: 'tabular-nums', color: row.atrisk > 0 ? 'var(--status-atrisk-text)' : undefined }}>
                      {row.atrisk}
                    </td>
                    <td className="py-1.5" style={{ fontVariantNumeric: 'tabular-nums', color: row.overdue > 0 ? 'var(--status-overdue-text)' : undefined }}>
                      {row.overdue}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td className="py-1.5" style={{ color: 'var(--faint)' }}>Unassigned</td>
                  <td className="py-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>{unassignedOpen.length}</td>
                  <td className="py-1.5">—</td>
                  <td className="py-1.5">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <form method="get" className="flex flex-wrap items-end gap-2 mb-4">
          <label className="flex flex-col gap-1 text-xs">
            <span style={{ color: 'var(--muted)' }}>Status</span>
            <select name="status" defaultValue={status ?? 'all'} className="input">
              <option value="all">All</option>
              {(['not_started', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span style={{ color: 'var(--muted)' }}>Assigned to</span>
            <select name="person" defaultValue={personFilter ?? 'all'} className="input">
              <option value="all">Everyone</option>
              <option value="unassigned">Unassigned</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <Button type="submit" size="sm">Filter</Button>
        </form>

        <div className="flex flex-col gap-2">
          {filtered.map(({ task, project, slaStatus }) => (
            <WorkloadTaskRow key={task.id} task={task} project={project} slaStatus={slaStatus} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>No tasks match this filter.</p>
          )}
        </div>
      </main>
    </>
  )
}
