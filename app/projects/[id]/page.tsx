import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import ProjectInfoCard from '@/components/ProjectInfoCard'
import NewTaskForm from '@/components/NewTaskForm'
import TaskRow from '@/components/TaskRow'
import Button from '@/components/ui/Button'
import { applyStandardChecklistAction } from '@/app/actions'
import { getPeople, getProjectById, getTasksForProject } from '@/lib/db'
import { getSlaStatus } from '@/lib/sla'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, allTasks, people] = await Promise.all([
    getProjectById(id),
    getTasksForProject(id),
    getPeople(),
  ])
  if (!project) notFound()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const withStatus = allTasks.map((task) => ({ task, slaStatus: getSlaStatus(task, today) }))
  const topLevel = withStatus.filter((t) => !t.task.parentTaskId)
  const subtasksByParent = new Map<string, typeof withStatus>()
  for (const entry of withStatus) {
    if (!entry.task.parentTaskId) continue
    const list = subtasksByParent.get(entry.task.parentTaskId) ?? []
    list.push(entry)
    subtasksByParent.set(entry.task.parentTaskId, list)
  }

  const applyChecklist = applyStandardChecklistAction.bind(null, project.id)

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <Link href="/" className="text-sm" style={{ color: 'var(--pine)' }}>
          ← All projects
        </Link>

        <div className="mt-3 mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{project.customerName}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {project.googleDriveFolderUrl && (
              <a
                href={project.googleDriveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium px-3 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
              >
                Drive Folder ↗
              </a>
            )}
            {project.googlePhotosFolderUrl && (
              <a
                href={project.googlePhotosFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium px-3 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
              >
                Photos Folder ↗
              </a>
            )}
            <Link
              href={`/projects/${project.id}/logs`}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
            >
              Daily Logs
            </Link>
            <Link
              href={`/projects/${project.id}/communications`}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
            >
              Communications
            </Link>
            <Link
              href={`/projects/${project.id}/budget`}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
            >
              Budget
            </Link>
            <Link
              href={`/projects/${project.id}/contacts`}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
            >
              Contacts
            </Link>
            <Link
              href={`/projects/${project.id}/time`}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
            >
              Time
            </Link>
            <Link
              href={`/projects/${project.id}/lifecycle`}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
            >
              Lifecycle
            </Link>
            <Link
              href={`/projects/${project.id}/gantt`}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border"
              style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}
            >
              Gantt
            </Link>
          </div>
        </div>

        <ProjectInfoCard project={project} />

        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <form action={applyChecklist}>
            <Button type="submit" variant="outline" size="sm">+ Add standard task checklist</Button>
          </form>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {topLevel.map(({ task, slaStatus }) => (
            <TaskRow
              key={task.id}
              projectId={project.id}
              task={task}
              slaStatus={slaStatus}
              people={people}
              subtasks={subtasksByParent.get(task.id) ?? []}
            />
          ))}
          {topLevel.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>
              No tasks yet — add one below, or apply the standard checklist above.
            </p>
          )}
        </div>

        <NewTaskForm projectId={project.id} people={people} />
      </main>
    </>
  )
}
