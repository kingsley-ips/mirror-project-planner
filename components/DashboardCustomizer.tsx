'use client'

import { useState } from 'react'
import { DASHBOARD_CARDS, type DashboardCardKey } from '@/lib/types'
import { updateDashboardCardsAction } from '@/app/actions'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function DashboardCustomizer({
  enabledCards,
  hasActivePerson,
}: {
  enabledCards: DashboardCardKey[]
  hasActivePerson: boolean
}) {
  const [open, setOpen] = useState(false)

  if (!hasActivePerson) {
    return (
      <span className="text-xs" style={{ color: 'var(--faint)' }}>
        Pick who you are on My Tasks to customize this dashboard
      </span>
    )
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Customize
      </Button>
    )
  }

  return (
    <Card className="absolute right-6 top-16 z-10 w-72">
      <form
        action={async (formData) => {
          await updateDashboardCardsAction(formData)
          setOpen(false)
        }}
        className="flex flex-col gap-3"
      >
        <p className="text-xs font-semibold">Show on my dashboard</p>
        {DASHBOARD_CARDS.map((c) => (
          <label key={c.key} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name={c.key}
              defaultChecked={enabledCards.includes(c.key)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">{c.label}</span>
              <br />
              <span className="text-xs" style={{ color: 'var(--faint)' }}>{c.description}</span>
            </span>
          </label>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <Button type="submit" size="sm">Save</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}
