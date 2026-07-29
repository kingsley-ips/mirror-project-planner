import 'server-only'
import { Resend } from 'resend'
import type { Person, Project, Task } from './types'

const FROM = process.env.EMAIL_FROM || 'Mirror Project Planner <onboarding@resend.dev>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

// Both send functions return whether the email actually went out. Callers
// that track "already notified" state (the SLA reminder cron) must only
// record success — marking a failed send as notified would silently
// suppress the real reminder later.
export async function sendTaskAssignedEmail(person: Person, task: Task, project: Project): Promise<boolean> {
  const resend = client()
  if (!resend) return false

  const projectUrl = `${SITE_URL}/projects/${project.id}`
  const dueText = task.dueDate ? `Due ${task.dueDate}` : 'No due date set'

  const { error } = await resend.emails.send({
    from: FROM,
    to: person.email,
    subject: `New task assigned: ${task.title}`,
    html: `
      <p>Hi ${person.name},</p>
      <p>You've been assigned a task on <strong>${project.name}</strong> (${project.customerName}):</p>
      <p style="font-size:16px; font-weight:600;">${task.title}</p>
      <p>Category: ${task.category}<br/>${dueText}</p>
      <p><a href="${projectUrl}">View project →</a></p>
    `,
  })

  if (error) {
    console.error('Failed to send task assignment email', error)
    return false
  }
  return true
}

export async function sendSlaReminderEmail(
  person: Person,
  task: Task,
  project: Project,
  status: 'atrisk' | 'overdue'
): Promise<boolean> {
  const resend = client()
  if (!resend) return false

  const projectUrl = `${SITE_URL}/projects/${project.id}`
  const headline = status === 'overdue'
    ? `Overdue: ${task.title}`
    : `Approaching deadline: ${task.title}`
  const bodyLine = status === 'overdue'
    ? `This task is now past its due date (${task.dueDate}).`
    : `This task is due soon (${task.dueDate}) and hasn't been marked done.`

  const { error } = await resend.emails.send({
    from: FROM,
    to: person.email,
    subject: headline,
    html: `
      <p>Hi ${person.name},</p>
      <p>${bodyLine}</p>
      <p><strong>${project.name}</strong> (${project.customerName}) — ${task.category}</p>
      <p><a href="${projectUrl}">View project →</a></p>
    `,
  })

  if (error) {
    console.error('Failed to send SLA reminder email', error)
    return false
  }
  return true
}
