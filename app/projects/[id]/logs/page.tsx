import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import DailyLogEntry from '@/components/DailyLogEntry'
import DailyLogForm from '@/components/DailyLogForm'
import { getDailyLogsForProject, getProjectById } from '@/lib/db'

export const dynamic = 'force-dynamic'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default async function DailyLogsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, logs] = await Promise.all([getProjectById(id), getDailyLogsForProject(id)])
  if (!project) notFound()

  const today = todayIso()
  const todayLog = logs.find((l) => l.logDate === today)

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <Link href={`/projects/${project.id}`} className="text-sm" style={{ color: 'var(--pine)' }}>
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-semibold mt-3 mb-1">Daily Logs</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          One entry per day — filled out by whoever's leading the crew that day.
        </p>

        {todayLog ? (
          <p className="text-sm mb-6" style={{ color: 'var(--faint)' }}>
            Today's log is already filled out — edit it below instead of adding a new one.
          </p>
        ) : (
          <div className="mb-6">
            <DailyLogForm projectId={project.id} />
          </div>
        )}

        <div className="flex flex-col gap-3">
          {logs.map((log) => (
            <DailyLogEntry key={log.id} projectId={project.id} log={log} />
          ))}
          {logs.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>No daily logs yet.</p>
          )}
        </div>
      </main>
    </>
  )
}
