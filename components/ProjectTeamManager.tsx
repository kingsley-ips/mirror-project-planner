import type { Person } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { addTeamMemberAction, removeTeamMemberAction } from '@/app/actions'

export default function ProjectTeamManager({
  projectId,
  teamMembers,
  allPeople,
}: {
  projectId: string
  teamMembers: Person[]
  allPeople: Person[]
}) {
  const addAction = addTeamMemberAction.bind(null, projectId)
  const removeAction = removeTeamMemberAction.bind(null, projectId)
  const teamIds = new Set(teamMembers.map((p) => p.id))
  const available = allPeople.filter((p) => !teamIds.has(p.id))

  return (
    <Card className="mb-4">
      <h2 className="text-sm font-semibold mb-3">Project Team</h2>
      <p className="text-xs mb-3" style={{ color: 'var(--faint)' }}>
        Only people on this list can have hours logged against this project.
      </p>
      <div className="flex flex-col gap-2 mb-3">
        {teamMembers.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 text-sm">
            <span>{p.name}{p.jobTitle ? ` · ${p.jobTitle}` : ''}</span>
            <form action={removeAction}>
              <input type="hidden" name="personId" value={p.id} />
              <Button type="submit" variant="ghost" size="sm">Remove</Button>
            </form>
          </div>
        ))}
        {teamMembers.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--faint)' }}>No one assigned yet.</p>
        )}
      </div>
      {available.length > 0 && (
        <form action={addAction} className="flex items-end gap-2">
          <label className="flex flex-col gap-1 text-xs flex-1">
            <span style={{ color: 'var(--muted)' }}>Add to team</span>
            <select name="personId" required className="input">
              <option value="">Select...</option>
              {available.map((p) => <option key={p.id} value={p.id}>{p.name}{p.jobTitle ? ` (${p.jobTitle})` : ''}</option>)}
            </select>
          </label>
          <Button type="submit" size="sm">Add</Button>
        </form>
      )}
    </Card>
  )
}
