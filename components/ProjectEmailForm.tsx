import { EMAIL_TAGS, type ProjectEmail } from '@/lib/types'
import Button from '@/components/ui/Button'
import { createProjectEmailAction, updateProjectEmailAction } from '@/app/actions'

export default function ProjectEmailForm({
  projectId,
  existing,
  onCancel,
}: {
  projectId: string
  existing?: ProjectEmail
  onCancel?: () => void
}) {
  const action = existing
    ? updateProjectEmailAction.bind(null, projectId, existing.id)
    : createProjectEmailAction.bind(null, projectId)

  return (
    <form action={action} className="flex flex-col gap-3 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: 'var(--muted)' }}>Tag</span>
          <select name="tag" defaultValue={existing?.tag ?? 'Other'} className="input">
            {EMAIL_TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs flex-1 min-w-[200px]">
          <span style={{ color: 'var(--muted)' }}>Subject</span>
          <input name="subject" defaultValue={existing?.subject ?? ''} className="input" placeholder="e.g. RE: Crane delivery window" />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Pasted email content</span>
        <textarea name="content" defaultValue={existing?.content ?? ''} required rows={5} className="input" placeholder="Paste the email text here so it's searchable later" />
      </label>

      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Link to original email (optional)</span>
        <input type="url" name="emailLink" defaultValue={existing?.emailLink ?? ''} className="input" placeholder="https://mail.google.com/..." />
      </label>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">{existing ? 'Save' : 'Log Email'}</Button>
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}
