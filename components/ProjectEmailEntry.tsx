'use client'

import { useState } from 'react'
import type { EmailTag, ProjectEmail } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ProjectEmailForm from '@/components/ProjectEmailForm'

const TAG_STYLE: Record<EmailTag, { bg: string; text: string }> = {
  Internal: { bg: 'var(--border-subtle)', text: 'var(--muted)' },
  Vendor: { bg: 'var(--status-atrisk-bg)', text: 'var(--status-atrisk-text)' },
  Owner: { bg: 'var(--status-ontrack-bg)', text: 'var(--status-ontrack-text)' },
  GC: { bg: '#E0F2FE', text: '#075985' },
  Other: { bg: 'var(--border-subtle)', text: 'var(--faint)' },
}

function TagBadge({ tag }: { tag: EmailTag }) {
  const style = TAG_STYLE[tag]
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {tag}
    </span>
  )
}

export default function ProjectEmailEntry({ projectId, email }: { projectId: string; email: ProjectEmail }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <ProjectEmailForm projectId={projectId} existing={email} onCancel={() => setEditing(false)} />
  }

  const logged = new Date(email.createdAt)

  return (
    <Card padded>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <TagBadge tag={email.tag} />
          <h3 className="font-medium text-sm">{email.subject || '(no subject)'}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
      </div>
      <p className="text-sm whitespace-pre-wrap mb-2">{email.content}</p>
      <p className="text-xs" style={{ color: 'var(--faint)' }}>
        {email.loggedBy ? `Logged by ${email.loggedBy.name}` : 'Logged by unknown'} · {logged.toLocaleDateString()}
        {email.emailLink && (
          <> · <a href={email.emailLink} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--pine)' }}>Original email ↗</a></>
        )}
      </p>
    </Card>
  )
}
