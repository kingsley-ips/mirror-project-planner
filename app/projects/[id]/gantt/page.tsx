import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import GanttChart from '@/components/GanttChart'
import { getProjectById, getTasksForProject } from '@/lib/db'
import { getSlaStatus } from '@/lib/sla'

export const dynamic = 'force-dynamic'

export default async function GanttPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, tasks] = await Promise.all([getProjectById(id), getTasksForProject(id)])
  if (!project) notFound()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const rows = tasks
    .filter((task) => !task.parentTaskId)
    .map((task) => ({ task, slaStatus: getSlaStatus(task, today) }))

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <Link href={`/projects/${project.id}`} className="text-sm" style={{ color: 'var(--pine)' }}>
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-semibold mt-3 mb-1">Gantt</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Every task's due date on one timeline. Dates recalculate automatically when the sold/projected
          install date changes, or when a task a rule depends on is marked done or first assigned.
        </p>

        <GanttChart project={project} rows={rows} />
      </main>
    </>
  )
}
