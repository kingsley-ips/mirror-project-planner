import Link from 'next/link'
import Header from '@/components/Header'
import VendorRow from '@/components/VendorRow'
import VendorForm from '@/components/VendorForm'
import { getVendors } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function VendorsPage() {
  const vendors = await getVendors()

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <Link href="/" className="text-sm" style={{ color: 'var(--pine)' }}>
          ← All projects
        </Link>

        <div className="mt-3 mb-6">
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Company-wide vendor list — add one here before logging an expense against it on a project's Budget page.
          </p>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {vendors.map((vendor) => (
            <VendorRow key={vendor.id} vendor={vendor} />
          ))}
          {vendors.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>No vendors added yet — add the first one below.</p>
          )}
        </div>

        <VendorForm />
      </main>
    </>
  )
}
