import type { ProjectContact } from '@/lib/types'
import Button from '@/components/ui/Button'
import { createProjectContactAction, updateProjectContactAction } from '@/app/actions'

export default function ContactForm({
  projectId,
  existing,
  onCancel,
}: {
  projectId: string
  existing?: ProjectContact
  onCancel?: () => void
}) {
  const action = existing
    ? updateProjectContactAction.bind(null, projectId, existing.id)
    : createProjectContactAction.bind(null, projectId)

  return (
    <form action={action} className="flex flex-col gap-3 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: 'var(--muted)' }}>Name</span>
          <input name="name" required defaultValue={existing?.name ?? ''} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: 'var(--muted)' }}>Role (e.g. GC, Roofer, Owner)</span>
          <input name="roleDescription" defaultValue={existing?.roleDescription ?? ''} className="input" />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Business</span>
        <input name="business" defaultValue={existing?.business ?? ''} className="input" />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: 'var(--muted)' }}>Phone</span>
          <input type="tel" name="phone" defaultValue={existing?.phone ?? ''} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: 'var(--muted)' }}>Other phone</span>
          <input type="tel" name="otherPhone" defaultValue={existing?.otherPhone ?? ''} className="input" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: 'var(--muted)' }}>Email</span>
          <input type="email" name="email" defaultValue={existing?.email ?? ''} className="input" />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Notes</span>
        <textarea name="notes" defaultValue={existing?.notes ?? ''} rows={2} className="input" />
      </label>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">{existing ? 'Save' : 'Add Contact'}</Button>
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}
