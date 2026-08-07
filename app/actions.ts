'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import * as db from '@/lib/db'
import { ACTIVE_PERSON_COOKIE, getActivePersonId } from '@/lib/activePerson'
import { sendTaskAssignedEmail } from '@/lib/email'
import { DASHBOARD_CARDS, EMAIL_TAGS, isTaskBlocked, PROJECT_STAGES, TIME_ENTRY_CATEGORIES, type EmailTag, type Person, type ProjectStage, type TaskCategory, type TaskStatus, type TimeEntryCategory } from '@/lib/types'

const TASK_CATEGORIES: TaskCategory[] = [
  'Pre Design', 'Design', 'Job Logistics', 'Material Logistics', 'Construction', 'Project Closeout',
]

const PERSON_TEAMS: Person['team'][] = ['Commercial', 'OPS', 'Design', 'Sales', 'Field']

export async function createProjectAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const customerName = String(formData.get('customerName') ?? '').trim()
  const stage = String(formData.get('stage') ?? 'Sales') as ProjectStage
  const soldInstallDate = (formData.get('soldInstallDate') as string) || null
  const projectedInstallDate = (formData.get('projectedInstallDate') as string) || null
  const googleDriveFolderUrl = (formData.get('googleDriveFolderUrl') as string) || null
  const googlePhotosFolderUrl = (formData.get('googlePhotosFolderUrl') as string) || null

  if (!name || !customerName) throw new Error('Project name and customer name are required')
  if (!PROJECT_STAGES.includes(stage)) throw new Error('Invalid stage')

  const id = await db.createProject({
    name, customerName, stage, soldInstallDate, projectedInstallDate, googleDriveFolderUrl, googlePhotosFolderUrl,
  })

  revalidatePath('/')
  redirect(`/projects/${id}`)
}

export async function updateProjectStageAction(projectId: string, formData: FormData) {
  const stage = String(formData.get('stage') ?? '') as ProjectStage
  if (!PROJECT_STAGES.includes(stage)) throw new Error('Invalid stage')

  await db.updateProjectStage(projectId, stage)
  revalidatePath('/')
  revalidatePath(`/projects/${projectId}`)
}

// "If SLA date is adjusted it changes all future dates" — editing the
// sold/projected install date is the actual trigger for cascading
// recalculation, so this recomputes every rule-driven task afterward.
export async function updateProjectAction(projectId: string, formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const customerName = String(formData.get('customerName') ?? '').trim()
  const soldInstallDate = (formData.get('soldInstallDate') as string) || null
  const projectedInstallDate = (formData.get('projectedInstallDate') as string) || null
  const googleDriveFolderUrl = (formData.get('googleDriveFolderUrl') as string) || null
  const googlePhotosFolderUrl = (formData.get('googlePhotosFolderUrl') as string) || null

  if (!name || !customerName) throw new Error('Project name and customer name are required')

  await db.updateProject(projectId, {
    name, customerName, soldInstallDate, projectedInstallDate, googleDriveFolderUrl, googlePhotosFolderUrl,
  })
  await db.recomputeTaskDueDates(projectId)

  revalidatePath('/')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/gantt`)
}

async function notifyNewAssignees(taskId: string, projectId: string, newAssigneeIds: string[]) {
  if (newAssigneeIds.length === 0) return
  const [project, task] = await Promise.all([db.getProjectById(projectId), db.getTaskById(taskId)])
  if (!project || !task) return

  await Promise.all(newAssigneeIds.map(async (personId) => {
    const person = await db.getPersonById(personId)
    if (person) await sendTaskAssignedEmail(person, task, project)
  }))
}

export async function createTaskAction(projectId: string, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const category = String(formData.get('category') ?? '') as TaskCategory
  const assigneeIds = formData.getAll('assigneeIds').map(String).filter(Boolean)
  const dueDate = (formData.get('dueDate') as string) || null
  const dueTime = (formData.get('dueTime') as string) || null
  const slaDaysRaw = formData.get('slaDays') as string
  const slaDays = slaDaysRaw ? Number(slaDaysRaw) : null
  const parentTaskId = (formData.get('parentTaskId') as string) || null

  if (!title) throw new Error('Task title is required')
  if (!TASK_CATEGORIES.includes(category)) throw new Error('Invalid category')

  const taskId = await db.createTask({ projectId, title, category, assigneeIds, dueDate, dueTime, slaDays, parentTaskId })
  await notifyNewAssignees(taskId, projectId, assigneeIds)
  await db.recomputeTaskDueDates(projectId)

  revalidatePath('/')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/gantt`)
}

export async function updateTaskAction(projectId: string, taskId: string, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const category = String(formData.get('category') ?? '') as TaskCategory
  const assigneeIds = formData.getAll('assigneeIds').map(String).filter(Boolean)
  const dueDate = (formData.get('dueDate') as string) || null
  const dueTime = (formData.get('dueTime') as string) || null
  const slaDaysRaw = formData.get('slaDays') as string
  const slaDays = slaDaysRaw ? Number(slaDaysRaw) : null

  if (!title) throw new Error('Task title is required')
  if (!TASK_CATEGORIES.includes(category)) throw new Error('Invalid category')

  const before = await db.getTaskById(taskId)
  const dueDateChanged = before !== null && before.dueDate !== dueDate
  await db.updateTask(taskId, { title, category, assigneeIds, dueDate, dueTime, dueDateChanged, slaDays })

  const beforeIds = new Set((before?.assignees ?? []).map((p) => p.id))
  const newlyAdded = assigneeIds.filter((id) => !beforeIds.has(id))
  await notifyNewAssignees(taskId, projectId, newlyAdded)
  await db.recomputeTaskDueDates(projectId)

  revalidatePath('/')
  revalidatePath('/tasks')
  revalidatePath('/my-tasks')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/gantt`)
}

export async function resetTaskDueDateAction(projectId: string, taskId: string) {
  await db.resetTaskDueDateOverride(taskId)
  await db.recomputeTaskDueDates(projectId)

  revalidatePath('/')
  revalidatePath('/tasks')
  revalidatePath('/my-tasks')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/gantt`)
}

export async function updateTaskStatusAction(projectId: string, formData: FormData) {
  const taskId = String(formData.get('taskId') ?? '')
  const status = String(formData.get('status') ?? '') as TaskStatus
  if (!taskId) throw new Error('Missing task id')
  if (!['not_started', 'in_progress', 'done'].includes(status)) throw new Error('Invalid status')

  const task = await db.getTaskById(taskId)
  // "Task does not become available until sub task has been completed" —
  // a task with incomplete subtasks can't move to in_progress or done.
  // The UI already hides this control when blocked; this is the
  // server-side backstop.
  if (status !== 'not_started' && task && isTaskBlocked(task)) return

  await db.updateTaskStatus(taskId, status)
  // A task being marked done can be the anchor for another task's rule
  // (e.g. Site Audit Report depends on Site Audit Complete finishing).
  await db.recomputeTaskDueDates(projectId)

  if (task) {
    const project = await db.getProjectById(projectId)
    if (project) {
      const completedAt = status === 'done' ? new Date().toISOString() : null
      await db.syncTaskCompletionToSalesforce(task.title, project, completedAt)
    }
  }

  revalidatePath('/')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/gantt`)
  revalidatePath('/my-tasks')
}

// One-click apply of the required-task checklist from the original
// one-pager. Only inserts tasks that aren't already present (matched by
// title) so it's safe to click more than once.
export async function applyStandardChecklistAction(projectId: string) {
  await db.applyStandardChecklist(projectId)

  revalidatePath('/')
  revalidatePath('/tasks')
  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/gantt`)
}

// Stand-in for real login until this folds into ip-toolbox-platform's
// shared auth. Just remembers which person you're viewing "My Tasks" as.
export async function setActivePersonAction(formData: FormData) {
  const personId = String(formData.get('personId') ?? '')
  if (!personId) throw new Error('Missing person id')

  const store = await cookies()
  store.set(ACTIVE_PERSON_COOKIE, personId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })
  redirect('/my-tasks')
}

export async function clearActivePersonAction() {
  const store = await cookies()
  store.delete(ACTIVE_PERSON_COOKIE)
  redirect('/my-tasks')
}

export async function updateDashboardCardsAction(formData: FormData) {
  const personId = await getActivePersonId()
  if (!personId) throw new Error('Pick who you are first')

  const cards = DASHBOARD_CARDS.map((c) => c.key).filter((key) => formData.get(key) === 'on')
  await db.updatePersonDashboardCards(personId, cards)
  revalidatePath('/')
}

export async function createPersonAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const team = String(formData.get('team') ?? '') as Person['team']
  const jobTitle = (formData.get('jobTitle') as string)?.trim() || null

  if (!name || !email) throw new Error('Name and email are required')
  if (!PERSON_TEAMS.includes(team)) throw new Error('Invalid team')

  await db.createPerson({ name, email, team, jobTitle })
  revalidatePath('/people')
}

export async function updatePersonAction(personId: string, formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const team = String(formData.get('team') ?? '') as Person['team']
  const jobTitle = (formData.get('jobTitle') as string)?.trim() || null

  if (!name || !email) throw new Error('Name and email are required')
  if (!PERSON_TEAMS.includes(team)) throw new Error('Invalid team')

  await db.updatePerson(personId, { name, email, team, jobTitle })
  revalidatePath('/people')
}

export async function deletePersonAction(personId: string) {
  await db.deletePerson(personId)
  revalidatePath('/people')
  revalidatePath('/tasks')
  revalidatePath('/')
}

function dailyLogFieldsFromForm(formData: FormData): Omit<db.DailyLogInput, 'createdBy'> {
  const field = (name: string) => (formData.get(name) as string)?.trim() || null
  const logDate = formData.get('logDate') as string
  if (!logDate) throw new Error('Date is required')

  return {
    logDate,
    weather: field('weather'),
    heatIndex: field('heatIndex'),
    dailyGoal: field('dailyGoal'),
    personnelOnSite: field('personnelOnSite'),
    otherTradesOnSite: field('otherTradesOnSite'),
    visitorsOnSite: field('visitorsOnSite'),
    anticipatedDelays: field('anticipatedDelays'),
    delaysOrBottlenecks: field('delaysOrBottlenecks'),
    projectUpdate: field('projectUpdate'),
    safetyIncidents: field('safetyIncidents'),
    notes: field('notes'),
  }
}

export async function createDailyLogAction(projectId: string, formData: FormData) {
  const fields = dailyLogFieldsFromForm(formData)
  const createdBy = await getActivePersonId()

  let logId: string
  try {
    logId = await db.createDailyLog(projectId, { ...fields, createdBy })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      throw new Error(`A daily log for ${fields.logDate} already exists for this project — edit that one instead.`)
    }
    throw err
  }

  const photos = formData.getAll('photos').filter((f): f is File => f instanceof File)
  await db.addDailyLogPhotos(logId, photos)

  revalidatePath(`/projects/${projectId}/logs`)
}

export async function updateDailyLogAction(projectId: string, logId: string, formData: FormData) {
  const fields = dailyLogFieldsFromForm(formData)
  await db.updateDailyLog(logId, fields)

  const photos = formData.getAll('photos').filter((f): f is File => f instanceof File)
  await db.addDailyLogPhotos(logId, photos)

  revalidatePath(`/projects/${projectId}/logs`)
}

function projectEmailFieldsFromForm(formData: FormData): Omit<db.ProjectEmailInput, 'loggedBy'> {
  const tag = String(formData.get('tag') ?? '') as EmailTag
  const content = String(formData.get('content') ?? '').trim()
  const subject = (formData.get('subject') as string)?.trim() || null
  const emailLink = (formData.get('emailLink') as string)?.trim() || null

  if (!EMAIL_TAGS.includes(tag)) throw new Error('Invalid tag')
  if (!content) throw new Error('Email content is required')

  return { tag, subject, content, emailLink }
}

export async function createProjectEmailAction(projectId: string, formData: FormData) {
  const fields = projectEmailFieldsFromForm(formData)
  const loggedBy = await getActivePersonId()
  await db.createProjectEmail(projectId, { ...fields, loggedBy })
  revalidatePath(`/projects/${projectId}/communications`)
}

export async function updateProjectEmailAction(projectId: string, emailId: string, formData: FormData) {
  const fields = projectEmailFieldsFromForm(formData)
  await db.updateProjectEmail(emailId, fields)
  revalidatePath(`/projects/${projectId}/communications`)
}

function money(formData: FormData, name: string): number {
  const raw = formData.get(name) as string
  const value = raw ? Number(raw) : 0
  if (Number.isNaN(value)) throw new Error(`Invalid number for ${name}`)
  return value
}

export async function updateProjectBudgetAction(projectId: string, formData: FormData) {
  await db.updateProjectBudget(projectId, {
    engineeringSoldCost: money(formData, 'engineeringSoldCost'),
    engineeringActualCost: money(formData, 'engineeringActualCost'),
    materialSoldCost: money(formData, 'materialSoldCost'),
    materialActualCost: money(formData, 'materialActualCost'),
    laborSoldCost: money(formData, 'laborSoldCost'),
    laborActualCost: money(formData, 'laborActualCost'),
    laborSoldHours: money(formData, 'laborSoldHours'),
    laborActualHours: money(formData, 'laborActualHours'),
    electricalSoldCost: money(formData, 'electricalSoldCost'),
    electricalActualCost: money(formData, 'electricalActualCost'),
  })
  revalidatePath('/')
  revalidatePath(`/projects/${projectId}/budget`)
}

export async function createProjectExpenseAction(projectId: string, formData: FormData) {
  const vendorId = String(formData.get('vendorId') ?? '')
  const amount = money(formData, 'amount')
  const description = (formData.get('description') as string)?.trim() || null
  const invoiceDate = (formData.get('invoiceDate') as string) || null

  if (!vendorId) throw new Error('Vendor is required')
  if (amount <= 0) throw new Error('Amount must be greater than zero')

  const loggedBy = await getActivePersonId()
  await db.createProjectExpense(projectId, { vendorId, amount, description, invoiceDate, loggedBy })

  revalidatePath('/')
  revalidatePath(`/projects/${projectId}/budget`)
}

export async function updateExpenseInvoiceNumberAction(projectId: string, formData: FormData) {
  const expenseId = String(formData.get('expenseId') ?? '')
  const invoiceNumber = (formData.get('invoiceNumber') as string)?.trim() || null
  if (!expenseId) throw new Error('Missing expense id')

  await db.updateProjectExpenseInvoiceNumber(expenseId, invoiceNumber)
  revalidatePath(`/projects/${projectId}/budget`)
}

export async function toggleExpensePaidAction(projectId: string, formData: FormData) {
  const expenseId = String(formData.get('expenseId') ?? '')
  const currentlyPaid = formData.get('currentlyPaid') === 'true'
  if (!expenseId) throw new Error('Missing expense id')

  await db.setProjectExpensePaid(expenseId, currentlyPaid ? null : new Date().toISOString().slice(0, 10))
  revalidatePath(`/projects/${projectId}/budget`)
}

function vendorFieldsFromForm(formData: FormData): db.VendorInput {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) throw new Error('Vendor name is required')

  const field = (fieldName: string) => (formData.get(fieldName) as string)?.trim() || null
  return { name, trade: field('trade'), phone: field('phone'), email: field('email'), notes: field('notes') }
}

export async function createVendorAction(formData: FormData) {
  const fields = vendorFieldsFromForm(formData)
  await db.createVendor(fields)
  revalidatePath('/vendors')
}

export async function updateVendorAction(vendorId: string, formData: FormData) {
  const fields = vendorFieldsFromForm(formData)
  await db.updateVendor(vendorId, fields)
  revalidatePath('/vendors')
}

export async function deleteVendorAction(vendorId: string) {
  try {
    await db.deleteVendor(vendorId)
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === '23503') {
      throw new Error('This vendor has expenses logged against it and can\'t be removed — the expense ledger has to stay a complete record.')
    }
    throw err
  }
  revalidatePath('/vendors')
}

function contactFieldsFromForm(formData: FormData): db.ProjectContactInput {
  const name = String(formData.get('name') ?? '').trim()
  if (!name) throw new Error('Name is required')

  const field = (fieldName: string) => (formData.get(fieldName) as string)?.trim() || null
  return {
    name,
    roleDescription: field('roleDescription'),
    business: field('business'),
    phone: field('phone'),
    otherPhone: field('otherPhone'),
    email: field('email'),
    notes: field('notes'),
  }
}

export async function createProjectContactAction(projectId: string, formData: FormData) {
  const fields = contactFieldsFromForm(formData)
  await db.createProjectContact(projectId, fields)
  revalidatePath(`/projects/${projectId}/contacts`)
}

export async function updateProjectContactAction(projectId: string, contactId: string, formData: FormData) {
  const fields = contactFieldsFromForm(formData)
  await db.updateProjectContact(contactId, fields)
  revalidatePath(`/projects/${projectId}/contacts`)
}

export async function deleteProjectContactAction(projectId: string, contactId: string) {
  await db.deleteProjectContact(contactId)
  revalidatePath(`/projects/${projectId}/contacts`)
}

export async function createTimeEntryAction(projectId: string, formData: FormData) {
  const personId = String(formData.get('personId') ?? '')
  const workDate = String(formData.get('workDate') ?? '')
  const hours = Number(formData.get('hours'))
  const category = String(formData.get('category') ?? '') as TimeEntryCategory
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!personId) throw new Error('Person is required')
  if (!workDate) throw new Error('Date is required')
  if (!hours || hours <= 0) throw new Error('Hours must be greater than zero')
  if (!TIME_ENTRY_CATEGORIES.includes(category)) throw new Error('Invalid category')

  // "Once an employee is assigned to a project, hours can be entered" —
  // the UI already only offers assigned people; this is the backstop.
  const team = await db.getProjectTeamMembers(projectId)
  if (!team.some((p) => p.id === personId)) {
    throw new Error('This person is not assigned to the project yet — add them to the team first')
  }

  await db.createTimeEntry(projectId, { personId, workDate, hours, category, notes })
  revalidatePath(`/projects/${projectId}/time`)
}

export async function addTeamMemberAction(projectId: string, formData: FormData) {
  const personId = String(formData.get('personId') ?? '')
  if (!personId) throw new Error('Person is required')

  await db.addProjectTeamMember(projectId, personId)
  revalidatePath(`/projects/${projectId}/time`)
}

export async function removeTeamMemberAction(projectId: string, formData: FormData) {
  const personId = String(formData.get('personId') ?? '')
  if (!personId) throw new Error('Person is required')

  await db.removeProjectTeamMember(projectId, personId)
  revalidatePath(`/projects/${projectId}/time`)
}
