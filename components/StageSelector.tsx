'use client'

import { useRef } from 'react'
import { PROJECT_STAGES, type ProjectStage } from '@/lib/types'
import { updateProjectStageAction } from '@/app/actions'

export default function StageSelector({
  projectId,
  currentStage,
}: {
  projectId: string
  currentStage: ProjectStage
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const action = updateProjectStageAction.bind(null, projectId)

  return (
    <form ref={formRef} action={action}>
      <select
        name="stage"
        defaultValue={currentStage}
        onChange={() => formRef.current?.requestSubmit()}
        className="text-sm font-medium rounded-lg border px-2 py-1"
        style={{ borderColor: 'var(--border)', color: 'var(--pine)' }}
      >
        {PROJECT_STAGES.map((stage) => (
          <option key={stage} value={stage}>{stage}</option>
        ))}
      </select>
    </form>
  )
}
