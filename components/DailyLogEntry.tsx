'use client'

import { useState } from 'react'
import type { DailyLog } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import DailyLogForm from '@/components/DailyLogForm'

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <p className="text-sm">
      <span style={{ color: 'var(--faint)' }}>{label}: </span>
      {value}
    </p>
  )
}

export default function DailyLogEntry({ projectId, log }: { projectId: string; log: DailyLog }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <DailyLogForm projectId={projectId} existing={log} onCancel={() => setEditing(false)} />
  }

  return (
    <Card padded>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h3 className="font-semibold text-sm">{log.logDate}</h3>
          <p className="text-xs" style={{ color: 'var(--faint)' }}>
            {log.createdBy ? `Logged by ${log.createdBy.name}` : 'Logged by unknown'}
            {log.weather ? ` · ${log.weather}` : ''}
            {log.heatIndex ? ` · Heat: ${log.heatIndex}` : ''}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
      </div>

      <div className="flex flex-col gap-1">
        <Row label="Goal" value={log.dailyGoal} />
        <Row label="Personnel on site" value={log.personnelOnSite} />
        <Row label="Other trades on site" value={log.otherTradesOnSite} />
        <Row label="Visitors" value={log.visitorsOnSite} />
        <Row label="Anticipated delays" value={log.anticipatedDelays} />
        <Row label="Delays / bottlenecks" value={log.delaysOrBottlenecks} />
        <Row label="Update" value={log.projectUpdate} />
        <Row label="Safety incidents" value={log.safetyIncidents} />
        <Row label="Notes" value={log.notes} />
      </div>

      {log.photoUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {log.photoUrls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" style={{ borderColor: 'var(--border)' }} />
            </a>
          ))}
        </div>
      )}
    </Card>
  )
}
