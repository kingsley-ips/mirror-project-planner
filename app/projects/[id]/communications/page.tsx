import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import ProjectEmailEntry from '@/components/ProjectEmailEntry'
import ProjectEmailForm from '@/components/ProjectEmailForm'
import { getProjectById, getProjectEmails } from '@/lib/db'
import { EMAIL_TAGS } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function CommunicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tag?: string; q?: string }>
}) {
  const { id } = await params
  const { tag, q } = await searchParams
  const [project, emails] = await Promise.all([getProjectById(id), getProjectEmails(id)])
  if (!project) notFound()

  const search = (q ?? '').trim().toLowerCase()
  const filtered = emails.filter((e) => {
    if (tag && tag !== 'all' && e.tag !== tag) return false
    if (search) {
      const haystack = `${e.subject ?? ''} ${e.content}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <Link href={`/projects/${project.id}`} className="text-sm" style={{ color: 'var(--pine)' }}>
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-semibold mt-3 mb-1">Communications</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Paste emails here and tag them so they're searchable later — instead of hunting through inboxes.
        </p>

        <div className="mb-6">
          <ProjectEmailForm projectId={project.id} />
        </div>

        <form method="get" className="flex flex-wrap items-end gap-2 mb-4">
          <label className="flex flex-col gap-1 text-xs">
            <span style={{ color: 'var(--muted)' }}>Tag</span>
            <select name="tag" defaultValue={tag ?? 'all'} className="input">
              <option value="all">All</option>
              {EMAIL_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs flex-1 min-w-[200px]">
            <span style={{ color: 'var(--muted)' }}>Search</span>
            <input name="q" defaultValue={q ?? ''} className="input" placeholder="Search subject or content" />
          </label>
          <button type="submit" className="text-sm font-semibold px-4 py-2 rounded-lg border-2" style={{ borderColor: 'var(--pine)', color: 'var(--pine)' }}>
            Search
          </button>
        </form>

        <div className="flex flex-col gap-3">
          {filtered.map((email) => (
            <ProjectEmailEntry key={email.id} projectId={project.id} email={email} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>
              {emails.length === 0 ? 'No emails logged yet.' : 'No emails match this filter.'}
            </p>
          )}
        </div>
      </main>
    </>
  )
}
