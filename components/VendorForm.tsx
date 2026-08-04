import type { Vendor } from '@/lib/types'
import Button from '@/components/ui/Button'
import { createVendorAction, updateVendorAction } from '@/app/actions'

export default function VendorForm({
  existing,
  onCancel,
}: {
  existing?: Vendor
  onCancel?: () => void
}) {
  const action = existing ? updateVendorAction.bind(null, existing.id) : createVendorAction

  return (
    <form action={action} className="flex flex-col gap-3 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: 'var(--muted)' }}>Name</span>
          <input name="name" required defaultValue={existing?.name ?? ''} className="input" placeholder="e.g. Home Depot" />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: 'var(--muted)' }}>Trade / category</span>
          <input name="trade" defaultValue={existing?.trade ?? ''} className="input" placeholder="e.g. Material Supply" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs">
          <span style={{ color: 'var(--muted)' }}>Phone</span>
          <input type="tel" name="phone" defaultValue={existing?.phone ?? ''} className="input" />
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
        <Button type="submit" size="sm">{existing ? 'Save' : 'Add Vendor'}</Button>
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}
