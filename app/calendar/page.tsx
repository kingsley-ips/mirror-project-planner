import Link from 'next/link'
import Header from '@/components/Header'
import CalendarGrid, { type CalendarEntry } from '@/components/CalendarGrid'
import Button from '@/components/ui/Button'
import { getAllTasksFlat, getPeople, getProjects } from '@/lib/db'
import { getSlaStatus } from '@/lib/sla'

export const dynamic = 'force-dynamic'

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseMonth(month?: string): Date {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, 1))
  }
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

function monthParamFor(monthDate: Date): string {
  return `${monthDate.getUTCFullYear()}-${String(monthDate.getUTCMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(monthDate: Date, delta: number): string {
  return monthParamFor(new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + delta, 1)))
}

const MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; projectId?: string; personId?: string }>
}) {
  const { month, projectId, personId } = await searchParams
  const monthDate = parseMonth(month)
  const monthParam = monthParamFor(monthDate)

  const [allTasks, projects, people] = await Promise.all([
    getAllTasksFlat(),
    getProjects(),
    getPeople(),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = toIsoDate(today)

  const filtered = allTasks.filter(({ task, project }) => {
    if (!task.dueDate) return false
    if (projectId && projectId !== 'all' && project.id !== projectId) return false
    if (personId && personId !== 'all' && !task.assignees.some((a) => a.id === personId)) return false
    return true
  })

  const entriesByDate = new Map<string, CalendarEntry[]>()
  for (const { task, project } of filtered) {
    const slaStatus = getSlaStatus(task, today)
    const list = entriesByDate.get(task.dueDate!) ?? []
    list.push({ task, project, slaStatus })
    entriesByDate.set(task.dueDate!, list)
  }

  const monthLink = (m: string) => {
    const sp = new URLSearchParams({ month: m, projectId: projectId ?? 'all', personId: personId ?? 'all' })
    return `/calendar?${sp.toString()}`
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Every task's due date, across every project. Filter by project or person below.
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Link href={monthLink(shiftMonth(monthDate, -1))}>
              <Button type="button" variant="outline" size="sm">← Prev</Button>
            </Link>
            <h2 className="text-lg font-semibold w-48 text-center">{MONTH_LABEL.format(monthDate)}</h2>
            <Link href={monthLink(shiftMonth(monthDate, 1))}>
              <Button type="button" variant="outline" size="sm">Next →</Button>
            </Link>
          </div>

          <form method="get" className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="month" value={monthParam} />
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: 'var(--muted)' }}>Project</span>
              <select name="projectId" defaultValue={projectId ?? 'all'} className="input">
                <option value="all">All Projects</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: 'var(--muted)' }}>Person</span>
              <select name="personId" defaultValue={personId ?? 'all'} className="input">
                <option value="all">Everyone</option>
                {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <Button type="submit" size="sm">Filter</Button>
          </form>
        </div>

        <CalendarGrid monthDate={monthDate} entriesByDate={entriesByDate} todayIso={todayIso} />
      </main>
    </>
  )
}
