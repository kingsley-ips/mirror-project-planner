import { NextRequest, NextResponse } from 'next/server'
import { getOpenTasksForReminderCheck, setTaskNotifiedStatus } from '@/lib/db'
import { sendSlaReminderEmail } from '@/lib/email'
import { getSlaStatus } from '@/lib/sla'

// Runs daily (see vercel.json). For every open, assigned task: if it's
// newly at-risk or overdue (status escalated since we last emailed about
// it), send one reminder and record the new status. If it's back on
// track, clear the record so a future re-entry into at-risk fires again.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const candidates = await getOpenTasksForReminderCheck()
  let notified = 0
  let reset = 0

  for (const { task, project, lastNotifiedStatus } of candidates) {
    const currentStatus = getSlaStatus(task, today)

    if (currentStatus === 'atrisk' || currentStatus === 'overdue') {
      if (currentStatus !== lastNotifiedStatus && task.assignees.length > 0) {
        const sentResults = await Promise.all(
          task.assignees.map((person) => sendSlaReminderEmail(person, task, project, currentStatus))
        )
        if (sentResults.some(Boolean)) {
          await setTaskNotifiedStatus(task.id, currentStatus)
          notified++
        }
      }
    } else if (lastNotifiedStatus !== null) {
      await setTaskNotifiedStatus(task.id, null)
      reset++
    }
  }

  return NextResponse.json({ checked: candidates.length, notified, reset })
}
