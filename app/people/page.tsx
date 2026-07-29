import Link from 'next/link'
import Header from '@/components/Header'
import PersonRow from '@/components/PersonRow'
import NewPersonForm from '@/components/NewPersonForm'
import { getPeople } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function PeoplePage() {
  const people = await getPeople()

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <Link href="/" className="text-sm" style={{ color: 'var(--pine)' }}>
          ← All projects
        </Link>

        <div className="mt-3 mb-6">
          <h1 className="text-2xl font-semibold">People</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Everyone who can be assigned a task. Add new team members here before assigning them work.
          </p>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {people.map((person) => (
            <PersonRow key={person.id} person={person} />
          ))}
          {people.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>No one added yet — add the first person below.</p>
          )}
        </div>

        <NewPersonForm />
      </main>
    </>
  )
}
