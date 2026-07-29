'use client'

import { useState } from 'react'
import type { ProjectContact } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ContactForm from '@/components/ContactForm'
import { deleteProjectContactAction } from '@/app/actions'

export default function ContactRow({ projectId, contact }: { projectId: string; contact: ProjectContact }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <ContactForm projectId={projectId} existing={contact} onCancel={() => setEditing(false)} />
  }

  return (
    <Card padded className="flex items-start justify-between gap-4">
      <div>
        <p className="font-medium text-sm">
          {contact.name}
          {contact.roleDescription && (
            <span className="ml-2 text-xs font-normal" style={{ color: 'var(--faint)' }}>{contact.roleDescription}</span>
          )}
        </p>
        {contact.business && <p className="text-xs" style={{ color: 'var(--muted)' }}>{contact.business}</p>}
        <p className="text-xs mt-1 flex flex-wrap gap-x-3" style={{ color: 'var(--faint)' }}>
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="hover:underline" style={{ color: 'var(--pine)' }}>{contact.phone}</a>
          )}
          {contact.otherPhone && (
            <a href={`tel:${contact.otherPhone}`} className="hover:underline" style={{ color: 'var(--pine)' }}>{contact.otherPhone}</a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="hover:underline" style={{ color: 'var(--pine)' }}>{contact.email}</a>
          )}
        </p>
        {contact.notes && <p className="text-xs mt-1" style={{ color: 'var(--faint)' }}>{contact.notes}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm(`Remove ${contact.name} from this project's contacts?`)) {
              deleteProjectContactAction(projectId, contact.id)
            }
          }}
        >
          Remove
        </Button>
      </div>
    </Card>
  )
}
