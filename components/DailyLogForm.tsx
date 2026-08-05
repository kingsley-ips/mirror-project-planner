import type { DailyLog } from '@/lib/types'
import Button from '@/components/ui/Button'
import { createDailyLogAction, updateDailyLogAction } from '@/app/actions'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function DailyLogForm({
  projectId,
  existing,
  onCancel,
}: {
  projectId: string
  existing?: DailyLog
  onCancel?: () => void
}) {
  const action = existing
    ? updateDailyLogAction.bind(null, projectId, existing.id)
    : createDailyLogAction.bind(null, projectId)

  return (
    <form action={action} className="flex flex-col gap-3 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Date">
          <input type="date" name="logDate" required defaultValue={existing?.logDate ?? todayIso()} className="input" />
        </Field>
        <Field label="Weather">
          <input name="weather" defaultValue={existing?.weather ?? ''} className="input" placeholder="e.g. Sunny, 88°F" />
        </Field>
        <Field label="OSHA Heat Index">
          <input name="heatIndex" defaultValue={existing?.heatIndex ?? ''} className="input" placeholder="e.g. Caution" />
        </Field>
      </div>

      <Field label="Daily goal">
        <input name="dailyGoal" defaultValue={existing?.dailyGoal ?? ''} className="input" />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Personnel on site">
          <textarea name="personnelOnSite" defaultValue={existing?.personnelOnSite ?? ''} className="input" rows={2} />
        </Field>
        <Field label="Other trades on site">
          <textarea name="otherTradesOnSite" defaultValue={existing?.otherTradesOnSite ?? ''} className="input" rows={2} />
        </Field>
        <Field label="Visitors on site">
          <textarea name="visitorsOnSite" defaultValue={existing?.visitorsOnSite ?? ''} className="input" rows={2} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Anticipated delays">
          <textarea name="anticipatedDelays" defaultValue={existing?.anticipatedDelays ?? ''} className="input" rows={2} />
        </Field>
        <Field label="Delays / bottlenecks today">
          <textarea name="delaysOrBottlenecks" defaultValue={existing?.delaysOrBottlenecks ?? ''} className="input" rows={2} />
        </Field>
      </div>

      <Field label="Project update">
        <textarea name="projectUpdate" defaultValue={existing?.projectUpdate ?? ''} className="input" rows={2} />
      </Field>

      <Field label="Safety incidents">
        <textarea name="safetyIncidents" defaultValue={existing?.safetyIncidents ?? ''} className="input" rows={2} />
      </Field>

      <Field label="Notes">
        <textarea name="notes" defaultValue={existing?.notes ?? ''} className="input" rows={2} />
      </Field>

      <Field label="Photos">
        <input type="file" name="photos" multiple accept="image/*" className="input" />
      </Field>
      {existing && existing.photoUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existing.photoUrls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" style={{ borderColor: 'var(--border)' }} />
            </a>
          ))}
        </div>
      )}
      <p className="text-xs" style={{ color: 'var(--faint)' }}>
        Older photos may still be in the project's Google Photos folder (linked at the top of the project page).
      </p>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm">{existing ? 'Save Log' : 'Add Log'}</Button>
        {onCancel && <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      {children}
    </label>
  )
}
