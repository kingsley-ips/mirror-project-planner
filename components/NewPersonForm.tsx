import type { Person } from '@/lib/types'
import Button from '@/components/ui/Button'
import { createPersonAction } from '@/app/actions'

const TEAMS: Person['team'][] = ['Commercial', 'OPS', 'Design', 'Sales', 'Field']

export default function NewPersonForm() {
  return (
    <form action={createPersonAction} className="flex flex-wrap items-end gap-2 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <label className="flex flex-col gap-1 text-xs flex-1 min-w-[140px]">
        <span style={{ color: 'var(--muted)' }}>Name</span>
        <input name="name" required className="input" placeholder="e.g. Jordan Rivera" />
      </label>
      <label className="flex flex-col gap-1 text-xs flex-1 min-w-[180px]">
        <span style={{ color: 'var(--muted)' }}>Email</span>
        <input type="email" name="email" required className="input" placeholder="name@solarips.com" />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: 'var(--muted)' }}>Team</span>
        <select name="team" className="input">
          {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs flex-1 min-w-[140px]">
        <span style={{ color: 'var(--muted)' }}>Job title</span>
        <input name="jobTitle" className="input" placeholder="e.g. Installer, Electrician" />
      </label>
      <Button type="submit" size="sm">Add Person</Button>
    </form>
  )
}
