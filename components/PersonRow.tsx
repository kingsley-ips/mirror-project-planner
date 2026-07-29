'use client'

import { useState } from 'react'
import type { Person } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { deletePersonAction, updatePersonAction } from '@/app/actions'

const TEAMS: Person['team'][] = ['Commercial', 'OPS', 'Design', 'Sales', 'Field']

export default function PersonRow({ person }: { person: Person }) {
  const [editing, setEditing] = useState(false)
  const action = updatePersonAction.bind(null, person.id)

  if (editing) {
    return (
      <Card padded>
        <form
          action={async (formData) => {
            await action(formData)
            setEditing(false)
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <label className="flex flex-col gap-1 text-xs flex-1 min-w-[140px]">
            <span style={{ color: 'var(--muted)' }}>Name</span>
            <input name="name" defaultValue={person.name} required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-xs flex-1 min-w-[180px]">
            <span style={{ color: 'var(--muted)' }}>Email</span>
            <input type="email" name="email" defaultValue={person.email} required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span style={{ color: 'var(--muted)' }}>Team</span>
            <select name="team" defaultValue={person.team} className="input">
              {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <Button type="submit" size="sm">Save</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
        </form>
      </Card>
    )
  }

  return (
    <Card padded className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">{person.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--faint)' }}>{person.email} · {person.team}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm(`Remove ${person.name}? Any tasks assigned to them will become unassigned.`)) {
              deletePersonAction(person.id)
            }
          }}
        >
          Remove
        </Button>
      </div>
    </Card>
  )
}
