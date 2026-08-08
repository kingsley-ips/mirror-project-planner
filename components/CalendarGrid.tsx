import Link from 'next/link'
import type { Project, SlaStatus, Task } from '@/lib/types'
import { SlaDot } from '@/components/ui/SlaStatus'

export interface CalendarEntry {
  task: Task
  project: Project
  slaStatus: SlaStatus
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function CalendarGrid({
  monthDate,
  entriesByDate,
  todayIso,
}: {
  monthDate: Date
  entriesByDate: Map<string, CalendarEntry[]>
  todayIso: string
}) {
  const year = monthDate.getUTCFullYear()
  const month = monthDate.getUTCMonth()
  const startWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

  const cells: (string | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(toIsoDate(new Date(Date.UTC(year, month, d))))
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-7" style={{ backgroundColor: 'var(--border-subtle)' }}>
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-xs font-semibold text-center py-2" style={{ color: 'var(--muted)' }}>
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((iso, i) => {
          const entries = iso ? entriesByDate.get(iso) ?? [] : []
          const isToday = iso === todayIso
          return (
            <div
              key={i}
              className="min-h-[112px] p-1.5 border-t border-l flex flex-col gap-1"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              {iso && (
                <>
                  <span
                    className="text-xs font-medium self-start px-1.5 rounded-full"
                    style={isToday ? { backgroundColor: 'var(--pine)', color: 'white' } : { color: 'var(--faint)' }}
                  >
                    {Number(iso.slice(8, 10))}
                  </span>
                  <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: '90px' }}>
                    {entries.map(({ task, project, slaStatus }) => (
                      <Link
                        key={task.id}
                        href={`/projects/${project.id}`}
                        className="text-[11px] leading-tight px-1.5 py-1 rounded-md hover:opacity-80 flex items-start gap-1"
                        style={{ backgroundColor: 'var(--border-subtle)' }}
                        title={`${task.title} — ${project.name}`}
                      >
                        <span className="mt-0.5 shrink-0"><SlaDot status={slaStatus} /></span>
                        <span className="truncate">
                          <span className="font-medium">{task.title}</span>
                          <br />
                          <span style={{ color: 'var(--faint)' }}>{task.category} · {project.name}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
