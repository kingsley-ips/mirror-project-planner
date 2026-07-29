import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import LifecycleSummary from '@/components/LifecycleSummary'
import { getProjectById, getStageHistoryForProject } from '@/lib/db'
import { summarizeLifecycle } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function LifecyclePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, history] = await Promise.all([getProjectById(id), getStageHistoryForProject(id)])
  if (!project) notFound()

  const summary = summarizeLifecycle(history, new Date())

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <Link href={`/projects/${project.id}`} className="text-sm" style={{ color: 'var(--pine)' }}>
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-semibold mt-3 mb-1">Lifecycle</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          How long this project has spent in each stage, and the overall cycle time.
        </p>

        <LifecycleSummary summary={summary} />
      </main>
    </>
  )
}
