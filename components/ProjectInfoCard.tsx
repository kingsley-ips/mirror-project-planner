'use client'

import { useState } from 'react'
import type { Project } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StageTracker from '@/components/StageTracker'
import StageSelector from '@/components/StageSelector'
import { updateProjectAction } from '@/app/actions'

export default function ProjectInfoCard({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false)
  const action = updateProjectAction.bind(null, project.id)

  if (editing) {
    return (
      <Card className="mb-6">
        <form
          action={async (formData) => {
            await action(formData)
            setEditing(false)
          }}
          className="flex flex-col gap-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: 'var(--muted)' }}>Project name</span>
              <input name="name" required defaultValue={project.name} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: 'var(--muted)' }}>Customer name</span>
              <input name="customerName" required defaultValue={project.customerName} className="input" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: 'var(--muted)' }}>Sold install date</span>
              <input type="date" name="soldInstallDate" defaultValue={project.soldInstallDate ?? ''} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: 'var(--muted)' }}>Projected install date</span>
              <input type="date" name="projectedInstallDate" defaultValue={project.projectedInstallDate ?? ''} className="input" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: 'var(--muted)' }}>Google Drive folder link</span>
              <input type="url" name="googleDriveFolderUrl" defaultValue={project.googleDriveFolderUrl ?? ''} className="input" />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span style={{ color: 'var(--muted)' }}>Google Photos folder link</span>
              <input type="url" name="googlePhotosFolderUrl" defaultValue={project.googlePhotosFolderUrl ?? ''} className="input" />
            </label>
          </div>
          <p className="text-xs" style={{ color: 'var(--faint)' }}>
            Changing either date recalculates every task whose due date is tied to it.
          </p>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm">Save</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <StageTracker currentStage={project.stage} />
        <div className="flex items-center gap-2 shrink-0">
          <StageSelector projectId={project.id} currentStage={project.stage} />
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span style={{ color: 'var(--faint)' }}>Sold Install Date</span>
          <p className="font-medium">{project.soldInstallDate ?? '—'}</p>
        </div>
        <div>
          <span style={{ color: 'var(--faint)' }}>Projected Install Date</span>
          <p className="font-medium">{project.projectedInstallDate ?? '—'}</p>
        </div>
      </div>
    </Card>
  )
}
