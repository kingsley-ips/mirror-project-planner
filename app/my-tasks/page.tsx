import Link from 'next/link'
import Header from '@/components/Header'
import PersonPicker from '@/components/PersonPicker'
import MyTaskRow from '@/components/MyTaskRow'
import Button from '@/components/ui/Button'
import { getActivePersonId } from '@/lib/activePerson'
import { clearActivePersonAction } from '@/app/actions'
import { getPeople, getPersonById, getTasksForPerson } from '@/lib/db'
import { getSlaStatus } from '@/lib/sla'
import type { SlaStatus } from '@/lib/types'

const URGENCY_RANK: Record<SlaStatus, number> = { overdue: 0, atrisk: 1, ontrack: 2, done: 3 }

type SortMode = 'urgency' | 'project' | 'dueDate'
const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'urgency', label: 'Urgency' },
  { value: 'project', label: 'Project' },
  { value: 'dueDate', label: 'Due Date' },
]

export const dynamic = 'force-dynamic'

export default async function MyTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const activePersonId = await getActivePersonId()

  if (!activePersonId) {
    const people = await getPeople()
    return (
      <>
        <Header />
        <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
          <PersonPicker people={people} />
        </main>
      </>
    )
  }

  const person = await getPersonById(activePersonId)
  if (!person) {
    const people = await getPeople()
    return (
      <>
        <Header />
        <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
          <PersonPicker people={people} />
        </main>
      </>
    )
  }

  const { sort } = await searchParams
  const sortMode: SortMode = sort === 'project' || sort === 'dueDate' ? sort : 'urgency'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const personTasks = await getTasksForPerson(person.id)
  const withStatus = personTasks.map((pt) => ({ ...pt, slaStatus: getSlaStatus(pt.task, today) }))

  const openTasks = withStatus.filter((t) => t.task.status !== 'done')
  const doneTasks = withStatus.filter((t) => t.task.status === 'done')

  if (sortMode === 'urgency') {
    openTasks.sort((a, b) => URGENCY_RANK[a.slaStatus] - URGENCY_RANK[b.slaStatus])
  } else if (sortMode === 'project') {
    openTasks.sort((a, b) => a.project.name.localeCompare(b.project.name))
  } else {
    openTasks.sort((a, b) => {
      if (!a.task.dueDate && !b.task.dueDate) return 0
      if (!a.task.dueDate) return 1
      if (!b.task.dueDate) return -1
      return a.task.dueDate.localeCompare(b.task.dueDate)
    })
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">My Tasks</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Viewing as <strong>{person.name}</strong> ({person.team})
            </p>
          </div>
          <form action={clearActivePersonAction}>
            <Button type="submit" variant="ghost" size="sm">Not you? Switch</Button>
          </form>
        </div>

        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-lg font-semibold">Open ({openTasks.length})</h2>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--faint)' }}>
            <span>Sort by:</span>
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={opt.value === 'urgency' ? '/my-tasks' : `/my-tasks?sort=${opt.value}`}
                className="px-2 py-0.5 rounded-full"
                style={
                  sortMode === opt.value
                    ? { backgroundColor: 'var(--pine)', color: 'white' }
                    : { color: 'var(--muted)' }
                }
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 mb-6">
          {openTasks.map(({ task, project, slaStatus }) => (
            <MyTaskRow key={task.id} task={task} project={project} slaStatus={slaStatus} viewingAs={person} />
          ))}
          {openTasks.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>Nothing open — you&rsquo;re all caught up.</p>
          )}
        </div>

        {doneTasks.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--muted)' }}>
              Done ({doneTasks.length})
            </h2>
            <div className="flex flex-col gap-2">
              {doneTasks.map(({ task, project, slaStatus }) => (
                <MyTaskRow key={task.id} task={task} project={project} slaStatus={slaStatus} viewingAs={person} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  )
}
