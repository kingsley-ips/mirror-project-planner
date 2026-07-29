import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import TimeSummaryCard from '@/components/TimeSummaryCard'
import TimeEntryForm from '@/components/TimeEntryForm'
import TimeEntryRow from '@/components/TimeEntryRow'
import { getPeople, getProjectById, getTimeEntriesForProject } from '@/lib/db'
import { summarizeTimeEntries } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function TimeTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, entries, people] = await Promise.all([
    getProjectById(id),
    getTimeEntriesForProject(id),
    getPeople(),
  ])
  if (!project) notFound()

  const summary = summarizeTimeEntries(entries)

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <Link href={`/projects/${project.id}`} className="text-sm" style={{ color: 'var(--pine)' }}>
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-semibold mt-3 mb-1">Time Tracking</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Hours logged per person, broken out into Install and Electrical totals.
        </p>

        <div className="mb-6">
          <TimeSummaryCard summary={summary} />
        </div>

        <div className="mb-4">
          <TimeEntryForm projectId={project.id} people={people} />
        </div>

        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <TimeEntryRow key={entry.id} entry={entry} />
          ))}
          {entries.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>No hours logged yet.</p>
          )}
        </div>
      </main>
    </>
  )
}
