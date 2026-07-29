import Link from 'next/link'
import Header from '@/components/Header'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PROJECT_STAGES } from '@/lib/types'
import { createProjectAction } from '@/app/actions'

export default function NewProjectPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-xl mx-auto w-full">
        <Link href="/" className="text-sm" style={{ color: 'var(--pine)' }}>
          ← All projects
        </Link>
        <h1 className="text-2xl font-semibold mt-3 mb-6">New Project</h1>

        <Card>
          <form action={createProjectAction} className="flex flex-col gap-4">
            <Field label="Project name">
              <input name="name" required className="input" />
            </Field>
            <Field label="Customer name">
              <input name="customerName" required className="input" />
            </Field>
            <Field label="Stage">
              <select name="stage" defaultValue="Sales" className="input">
                {PROJECT_STAGES.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </Field>
            <Field label="Sold install date">
              <input type="date" name="soldInstallDate" className="input" />
            </Field>
            <Field label="Projected install date">
              <input type="date" name="projectedInstallDate" className="input" />
            </Field>
            <Field label="Google Drive folder link">
              <input type="url" name="googleDriveFolderUrl" placeholder="https://drive.google.com/..." className="input" />
            </Field>
            <Field label="Google Photos folder link">
              <input type="url" name="googlePhotosFolderUrl" placeholder="https://photos.google.com/..." className="input" />
            </Field>
            <Button type="submit" className="mt-2">Create Project</Button>
          </form>
        </Card>
      </main>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      {children}
    </label>
  )
}
