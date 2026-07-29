import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import ContactRow from '@/components/ContactRow'
import ContactForm from '@/components/ContactForm'
import { getProjectById, getProjectContacts } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, contacts] = await Promise.all([getProjectById(id), getProjectContacts(id)])
  if (!project) notFound()

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <Link href={`/projects/${project.id}`} className="text-sm" style={{ color: 'var(--pine)' }}>
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-semibold mt-3 mb-1">Contacts</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          GC, EC, roofer, owner — as many or as few as this project needs.
        </p>

        <div className="mb-6">
          <ContactForm projectId={project.id} />
        </div>

        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <ContactRow key={contact.id} projectId={project.id} contact={contact} />
          ))}
          {contacts.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>No contacts added yet.</p>
          )}
        </div>
      </main>
    </>
  )
}
