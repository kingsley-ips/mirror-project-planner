import 'server-only'
import { supabaseServer } from './supabase/server'
import type { DailyLog, DashboardCardKey, EmailTag, Person, Project, ProjectBudget, ProjectContact, ProjectEmail, ProjectExpense, ProjectStage, ProjectStageHistory, Task, TaskCategory, TaskStatus, TimeEntry, TimeEntryCategory, Vendor } from './types'
import { DEFAULT_DASHBOARD_CARDS, isDashboardCardKey } from './types'
import { SLA_RULES } from './slaRules'
import { TASK_TEMPLATES } from './taskTemplates'
import { fetchSalesforceIpsProjects, SALESFORCE_WRITEBACK_FIELDS, writeBackTaskDate } from './salesforce'

type PersonRow = { id: string; name: string; email: string; team: Person['team']; job_title: string | null; dashboard_cards: string[] | null }
type ProjectRow = {
  id: string; name: string; customer_name: string; stage: ProjectStage
  sold_install_date: string | null; projected_install_date: string | null
  google_drive_folder_url: string | null; google_photos_folder_url: string | null
  created_at: string; salesforce_id: string | null
}
type TaskRow = {
  id: string; project_id: string; title: string; category: TaskCategory
  due_date: string | null; due_time: string | null; due_date_overridden: boolean; sla_days: number | null
  status: TaskStatus; completed_at: string | null
  parent_task_id: string | null
  task_assignees: { people: PersonRow | null }[]
}
type ReminderTaskRow = TaskRow & {
  last_notified_status: 'atrisk' | 'overdue' | null
  projects: ProjectRow | null
}

type ProjectEmailRow = {
  id: string; project_id: string; tag: EmailTag; subject: string | null
  content: string; email_link: string | null; created_at: string
  people: PersonRow | null
}

type DailyLogRow = {
  id: string; project_id: string; log_date: string
  weather: string | null; heat_index: string | null; daily_goal: string | null
  personnel_on_site: string | null; other_trades_on_site: string | null; visitors_on_site: string | null
  anticipated_delays: string | null; delays_or_bottlenecks: string | null
  project_update: string | null; safety_incidents: string | null; notes: string | null
  created_at: string
  people: PersonRow | null
  daily_log_photos: { url: string }[]
}

type ProjectBudgetRow = {
  project_id: string
  engineering_sold_cost: string; engineering_actual_cost: string
  material_sold_cost: string; material_actual_cost: string
  labor_sold_cost: string; labor_actual_cost: string
  labor_sold_hours: string; labor_actual_hours: string
  electrical_sold_cost: string; electrical_actual_cost: string
  updated_at: string
}

type VendorRow = {
  id: string; name: string; trade: string | null
  phone: string | null; email: string | null; notes: string | null
}

type ProjectExpenseRow = {
  id: string; project_id: string; amount: string
  description: string | null; invoice_date: string | null; created_at: string
  invoice_number: string | null; invoice_paid_date: string | null
  people: PersonRow | null
  vendors: VendorRow
}

type ProjectContactRow = {
  id: string; project_id: string; name: string; role_description: string | null
  business: string | null; phone: string | null; other_phone: string | null
  email: string | null; notes: string | null
}

type TimeEntryRow = {
  id: string; project_id: string; work_date: string; hours: string
  category: TimeEntryCategory; notes: string | null; created_at: string
  people: PersonRow
}

type SubtaskStats = { subtaskCount: number; incompleteSubtaskCount: number }

function toPerson(row: PersonRow): Person {
  const dashboardCards = row.dashboard_cards?.filter(isDashboardCardKey) as DashboardCardKey[] | undefined
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    team: row.team,
    jobTitle: row.job_title,
    dashboardCards: dashboardCards && dashboardCards.length > 0 ? dashboardCards : DEFAULT_DASHBOARD_CARDS,
  }
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    customerName: row.customer_name,
    stage: row.stage,
    soldInstallDate: row.sold_install_date,
    projectedInstallDate: row.projected_install_date,
    googleDriveFolderUrl: row.google_drive_folder_url,
    googlePhotosFolderUrl: row.google_photos_folder_url,
    createdAt: row.created_at,
    salesforceId: row.salesforce_id,
  }
}

function toTask(row: TaskRow, stats?: SubtaskStats): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    category: row.category,
    assignees: (row.task_assignees ?? [])
      .map((ta) => ta.people)
      .filter((p): p is PersonRow => p !== null)
      .map(toPerson),
    dueDate: row.due_date,
    dueTime: row.due_time,
    dueDateOverridden: row.due_date_overridden,
    slaDays: row.sla_days,
    status: row.status,
    completedAt: row.completed_at,
    parentTaskId: row.parent_task_id,
    subtaskCount: stats?.subtaskCount ?? 0,
    incompleteSubtaskCount: stats?.incompleteSubtaskCount ?? 0,
  }
}

function toDailyLog(row: DailyLogRow): DailyLog {
  return {
    id: row.id,
    projectId: row.project_id,
    logDate: row.log_date,
    weather: row.weather,
    heatIndex: row.heat_index,
    dailyGoal: row.daily_goal,
    personnelOnSite: row.personnel_on_site,
    otherTradesOnSite: row.other_trades_on_site,
    visitorsOnSite: row.visitors_on_site,
    anticipatedDelays: row.anticipated_delays,
    delaysOrBottlenecks: row.delays_or_bottlenecks,
    projectUpdate: row.project_update,
    safetyIncidents: row.safety_incidents,
    notes: row.notes,
    createdBy: row.people ? toPerson(row.people) : null,
    createdAt: row.created_at,
    photoUrls: (row.daily_log_photos ?? []).map((p) => p.url),
  }
}

function toProjectEmail(row: ProjectEmailRow): ProjectEmail {
  return {
    id: row.id,
    projectId: row.project_id,
    tag: row.tag,
    subject: row.subject,
    content: row.content,
    emailLink: row.email_link,
    loggedBy: row.people ? toPerson(row.people) : null,
    createdAt: row.created_at,
  }
}

function toProjectBudget(row: ProjectBudgetRow): ProjectBudget {
  return {
    projectId: row.project_id,
    engineeringSoldCost: Number(row.engineering_sold_cost),
    engineeringActualCost: Number(row.engineering_actual_cost),
    materialSoldCost: Number(row.material_sold_cost),
    materialActualCost: Number(row.material_actual_cost),
    laborSoldCost: Number(row.labor_sold_cost),
    laborActualCost: Number(row.labor_actual_cost),
    laborSoldHours: Number(row.labor_sold_hours),
    laborActualHours: Number(row.labor_actual_hours),
    electricalSoldCost: Number(row.electrical_sold_cost),
    electricalActualCost: Number(row.electrical_actual_cost),
    updatedAt: row.updated_at,
  }
}

function toVendor(row: VendorRow): Vendor {
  return {
    id: row.id,
    name: row.name,
    trade: row.trade,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
  }
}

function toProjectExpense(row: ProjectExpenseRow): ProjectExpense {
  return {
    id: row.id,
    projectId: row.project_id,
    vendor: toVendor(row.vendors),
    amount: Number(row.amount),
    description: row.description,
    invoiceDate: row.invoice_date,
    invoiceNumber: row.invoice_number,
    invoicePaidDate: row.invoice_paid_date,
    loggedBy: row.people ? toPerson(row.people) : null,
    createdAt: row.created_at,
  }
}

function toProjectContact(row: ProjectContactRow): ProjectContact {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    roleDescription: row.role_description,
    business: row.business,
    phone: row.phone,
    otherPhone: row.other_phone,
    email: row.email,
    notes: row.notes,
  }
}

function toTimeEntry(row: TimeEntryRow): TimeEntry {
  return {
    id: row.id,
    projectId: row.project_id,
    person: toPerson(row.people),
    workDate: row.work_date,
    hours: Number(row.hours),
    category: row.category,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

// One query, batched: for every id in taskIds, how many direct subtasks it
// has and how many of those aren't done yet. Used to compute whether a
// task is "blocked" (can't move to in_progress/done until subtasks finish).
// Deliberately unscoped — a `.in('parent_task_id', taskIds)` filter with
// hundreds of ids (every task across every project, once Salesforce sync
// populated dozens of projects) builds a URL long enough for Supabase's
// gateway to reject as a 400. A full-table scan of two narrow columns is
// cheap and has no such ceiling, so every caller uses this instead.
async function getSubtaskStatsForAll(): Promise<Map<string, SubtaskStats>> {
  const map = new Map<string, SubtaskStats>()
  const db = supabaseServer()
  const { data, error } = await db.from('tasks').select('parent_task_id, status').not('parent_task_id', 'is', null)
  if (error) throw error

  for (const row of data as { parent_task_id: string; status: TaskStatus }[]) {
    const stats = map.get(row.parent_task_id) ?? { subtaskCount: 0, incompleteSubtaskCount: 0 }
    stats.subtaskCount++
    if (row.status !== 'done') stats.incompleteSubtaskCount++
    map.set(row.parent_task_id, stats)
  }
  return map
}

const TASK_SELECT = '*, task_assignees(people(*))'

export async function getProjects(): Promise<Project[]> {
  const db = supabaseServer()
  const { data, error } = await db.from('projects').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data as ProjectRow[]).map(toProject)
}

export async function getProjectById(id: string): Promise<Project | null> {
  const db = supabaseServer()
  const { data, error } = await db.from('projects').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? toProject(data as ProjectRow) : null
}

export async function getTaskById(id: string): Promise<Task | null> {
  const db = supabaseServer()
  const { data, error } = await db.from('tasks').select(TASK_SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) return null
  const stats = await getSubtaskStatsForAll()
  return toTask(data as TaskRow, stats.get(id))
}

// Returns every task in the project — both top-level tasks and subtasks —
// as a flat list. Callers group by `parentTaskId` to nest subtasks under
// their parent in the UI.
export async function getTasksForProject(projectId: string): Promise<Task[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('tasks')
    .select(TASK_SELECT)
    .eq('project_id', projectId)
    .order('due_date', { ascending: true, nullsFirst: false })
  if (error) throw error
  const rows = data as TaskRow[]
  const statsMap = await getSubtaskStatsForAll()
  return rows.map((row) => toTask(row, statsMap.get(row.id)))
}

export interface TaskWithProject {
  task: Task
  project: Project
}

// Every task across every project, flat, with its project attached — the
// source for the org-wide workload view and the dashboard's per-project
// rollups.
export async function getAllTasksFlat(): Promise<TaskWithProject[]> {
  const db = supabaseServer()
  const { data, error } = await db.from('tasks').select(`${TASK_SELECT}, projects(*)`)
  if (error) throw error
  const rows = (data as ReminderTaskRow[]).filter((row) => row.projects !== null)
  const statsMap = await getSubtaskStatsForAll()
  return rows.map((row) => ({
    task: toTask(row, statsMap.get(row.id)),
    project: toProject(row.projects!),
  }))
}

export async function getAllTasksByProject(): Promise<Record<string, Task[]>> {
  const flat = await getAllTasksFlat()
  const byProject: Record<string, Task[]> = {}
  for (const { task } of flat) {
    byProject[task.projectId] ??= []
    byProject[task.projectId].push(task)
  }
  return byProject
}

export interface PersonTask {
  task: Task
  project: Project
}

export async function getTasksForPerson(personId: string): Promise<PersonTask[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('task_assignees')
    .select(`tasks(${TASK_SELECT}, projects(*))`)
    .eq('person_id', personId)
  if (error) throw error

  const rows = (data as unknown as { tasks: ReminderTaskRow | null }[])
    .map((r) => r.tasks)
    .filter((t): t is ReminderTaskRow => t !== null && t.projects !== null)

  const statsMap = await getSubtaskStatsForAll()
  const results = rows.map((row) => ({
    task: toTask(row, statsMap.get(row.id)),
    project: toProject(row.projects!),
  }))

  results.sort((a, b) => {
    if (!a.task.dueDate && !b.task.dueDate) return 0
    if (!a.task.dueDate) return 1
    if (!b.task.dueDate) return -1
    return a.task.dueDate.localeCompare(b.task.dueDate)
  })
  return results
}

export async function getPersonById(id: string): Promise<Person | null> {
  const db = supabaseServer()
  const { data, error } = await db.from('people').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? toPerson(data as PersonRow) : null
}

export async function getPeople(): Promise<Person[]> {
  const db = supabaseServer()
  const { data, error } = await db.from('people').select('*').order('name')
  if (error) throw error
  return (data as PersonRow[]).map(toPerson)
}

export async function createPerson(input: {
  name: string
  email: string
  team: Person['team']
  jobTitle: string | null
}): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('people')
    .insert({ name: input.name, email: input.email, team: input.team, job_title: input.jobTitle })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updatePerson(id: string, input: {
  name: string
  email: string
  team: Person['team']
  jobTitle: string | null
}): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('people')
    .update({ name: input.name, email: input.email, team: input.team, job_title: input.jobTitle })
    .eq('id', id)
  if (error) throw error
}

export async function updatePersonDashboardCards(id: string, cards: DashboardCardKey[]): Promise<void> {
  const db = supabaseServer()
  const { error } = await db.from('people').update({ dashboard_cards: cards }).eq('id', id)
  if (error) throw error
}

export async function deletePerson(id: string): Promise<void> {
  const db = supabaseServer()
  const { error } = await db.from('people').delete().eq('id', id)
  if (error) throw error
}

export async function createProject(input: {
  name: string
  customerName: string
  stage: ProjectStage
  soldInstallDate: string | null
  projectedInstallDate: string | null
  googleDriveFolderUrl: string | null
  googlePhotosFolderUrl: string | null
  salesforceId?: string | null
}): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('projects')
    .insert({
      name: input.name,
      customer_name: input.customerName,
      stage: input.stage,
      sold_install_date: input.soldInstallDate,
      projected_install_date: input.projectedInstallDate,
      google_drive_folder_url: input.googleDriveFolderUrl,
      google_photos_folder_url: input.googlePhotosFolderUrl,
      salesforce_id: input.salesforceId ?? null,
    })
    .select('id')
    .single()
  if (error) throw error

  const { error: historyError } = await db
    .from('project_stage_history')
    .insert({ project_id: data.id, stage: input.stage })
  if (historyError) throw historyError

  // Per the doc's own framing, every project gets the full required
  // checklist the moment it exists — not gated behind a manual click.
  await applyStandardChecklist(data.id)

  return data.id
}

export async function applyStandardChecklist(projectId: string): Promise<void> {
  const existing = await getTasksForProject(projectId)
  const existingTitles = new Set(existing.map((t) => t.title))
  const missing = TASK_TEMPLATES.filter((t) => !existingTitles.has(t.title))
  if (missing.length === 0) return

  // One bulk insert instead of one round trip per template — matters
  // once something (like the Salesforce sync) creates many projects in
  // a single request, each needing all ~38 checklist tasks at once.
  const db = supabaseServer()
  const { error } = await db.from('tasks').insert(
    missing.map((t) => ({
      project_id: projectId,
      title: t.title,
      category: t.category,
      due_date: null,
      sla_days: null,
      parent_task_id: null,
    }))
  )
  if (error) throw error

  await recomputeTaskDueDates(projectId)
}

export async function updateProjectStage(id: string, stage: ProjectStage): Promise<void> {
  const db = supabaseServer()
  const { error } = await db.from('projects').update({ stage }).eq('id', id)
  if (error) throw error

  const { error: historyError } = await db
    .from('project_stage_history')
    .insert({ project_id: id, stage })
  if (historyError) throw historyError
}

export interface ProjectUpdateInput {
  name: string
  customerName: string
  soldInstallDate: string | null
  projectedInstallDate: string | null
  googleDriveFolderUrl: string | null
  googlePhotosFolderUrl: string | null
}

// Editing sold/projected install date is the trigger for "if the SLA
// date is adjusted, it changes all future dates" — callers must follow
// this with recomputeTaskDueDates(id).
export async function updateProject(id: string, input: ProjectUpdateInput): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('projects')
    .update({
      name: input.name,
      customer_name: input.customerName,
      sold_install_date: input.soldInstallDate,
      projected_install_date: input.projectedInstallDate,
      google_drive_folder_url: input.googleDriveFolderUrl,
      google_photos_folder_url: input.googlePhotosFolderUrl,
    })
    .eq('id', id)
  if (error) throw error
}

// IPS_Project__c only ever has an "active, sold" record — Salesforce
// separates the open-pipeline story into Opportunity/Lead. So every
// record found here is meant to exist in Mirror; there's no stage
// filter for "is this sold yet." Intake and Site Audit both collapse
// into Mirror's single "Sales" stage since Mirror doesn't split them.
const SALESFORCE_STAGE_MAP: Record<string, ProjectStage> = {
  'Intake': 'Sales',
  'Site Audit': 'Sales',
  'Design': 'Design',
  'Permitting/Utility': 'Permitting/Utility',
  'Construction': 'Construction',
  'Final Deliverables': 'Final Deliverables',
  'Complete': 'Complete',
  'On Hold': 'On Hold',
}

type SyncedProjectRow = {
  id: string; name: string; customer_name: string; stage: ProjectStage
  sold_install_date: string | null; projected_install_date: string | null
  google_drive_folder_url: string | null; google_photos_folder_url: string | null
  salesforce_id: string
}

export interface SalesforceSyncResult {
  created: number
  updated: number
  unchanged: number
  total: number
  pendingCreate: number
}

// New projects are the expensive path (project row + ~38 checklist tasks
// + due-date recompute), so a large backlog is capped per run and drains
// over successive 15-minute cron ticks instead of risking a serverless
// timeout. Updates to already-linked projects are cheap and uncapped.
const MAX_CREATES_PER_RUN = 12

export async function syncSalesforceProjects(): Promise<SalesforceSyncResult> {
  const [sfProjects, db] = [await fetchSalesforceIpsProjects(), supabaseServer()]

  const { data: existingRows, error } = await db
    .from('projects')
    .select('id, name, customer_name, stage, sold_install_date, projected_install_date, google_drive_folder_url, google_photos_folder_url, salesforce_id')
    .not('salesforce_id', 'is', null)
  if (error) throw error

  const bySalesforceId = new Map((existingRows as SyncedProjectRow[]).map((r) => [r.salesforce_id, r]))

  let created = 0
  let updated = 0
  let unchanged = 0
  let pendingCreate = 0

  for (const sf of sfProjects) {
    const customerName = sf.accountName ?? sf.name
    const mappedStage = sf.stage ? SALESFORCE_STAGE_MAP[sf.stage] : undefined
    const existing = bySalesforceId.get(sf.id)

    if (!existing) {
      if (created >= MAX_CREATES_PER_RUN) {
        pendingCreate++
        continue
      }
      await createProject({
        name: sf.name,
        customerName,
        stage: mappedStage ?? 'Sales',
        soldInstallDate: sf.contractSignedDate,
        projectedInstallDate: sf.estimatedInstallDate,
        googleDriveFolderUrl: null,
        googlePhotosFolderUrl: null,
        salesforceId: sf.id,
      })
      created++
      continue
    }

    const fieldsChanged =
      existing.name !== sf.name ||
      existing.customer_name !== customerName ||
      existing.sold_install_date !== sf.contractSignedDate ||
      existing.projected_install_date !== sf.estimatedInstallDate
    const stageChanged = mappedStage !== undefined && mappedStage !== existing.stage

    if (fieldsChanged) {
      await updateProject(existing.id, {
        name: sf.name,
        customerName,
        soldInstallDate: sf.contractSignedDate,
        projectedInstallDate: sf.estimatedInstallDate,
        googleDriveFolderUrl: existing.google_drive_folder_url,
        googlePhotosFolderUrl: existing.google_photos_folder_url,
      })
      await recomputeTaskDueDates(existing.id)
    }
    if (stageChanged) {
      await updateProjectStage(existing.id, mappedStage as ProjectStage)
    }
    if (fieldsChanged || stageChanged) updated++
    else unchanged++
  }

  return { created, updated, unchanged, total: sfProjects.length, pendingCreate }
}

export async function getStageHistoryForProject(projectId: string): Promise<ProjectStageHistory[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_stage_history')
    .select('*')
    .eq('project_id', projectId)
    .order('entered_at', { ascending: true })
  if (error) throw error
  return (data as { id: string; project_id: string; stage: ProjectStage; entered_at: string }[]).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    stage: row.stage,
    enteredAt: row.entered_at,
  }))
}

async function setTaskAssignees(taskId: string, personIds: string[]): Promise<void> {
  const db = supabaseServer()
  const { error: deleteError } = await db.from('task_assignees').delete().eq('task_id', taskId)
  if (deleteError) throw deleteError
  if (personIds.length === 0) return
  const { error: insertError } = await db
    .from('task_assignees')
    .insert(personIds.map((personId) => ({ task_id: taskId, person_id: personId })))
  if (insertError) throw insertError

  // "Electrical Review: 5 days once assigned" needs to know the FIRST
  // time a task got an assignee — set once, never overwritten by a
  // later reassignment.
  const { data: current } = await db.from('tasks').select('first_assigned_at').eq('id', taskId).single()
  if (current && !current.first_assigned_at) {
    await db.from('tasks').update({ first_assigned_at: new Date().toISOString() }).eq('id', taskId)
  }
}

export async function createTask(input: {
  projectId: string
  title: string
  category: TaskCategory
  assigneeIds: string[]
  dueDate: string | null
  dueTime: string | null
  slaDays: number | null
  parentTaskId?: string | null
}): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('tasks')
    .insert({
      project_id: input.projectId,
      title: input.title,
      category: input.category,
      due_date: input.dueDate,
      due_time: input.dueTime,
      // An explicit date typed in at creation counts as a manual choice —
      // otherwise the cascade engine would silently recalculate it away
      // on the very next recompute, same bug as the edit-form case.
      due_date_overridden: input.dueDate !== null,
      sla_days: input.slaDays,
      parent_task_id: input.parentTaskId ?? null,
    })
    .select('id')
    .single()
  if (error) throw error

  if (input.assigneeIds.length > 0) await setTaskAssignees(data.id, input.assigneeIds)
  return data.id
}

export async function updateTask(id: string, input: {
  title: string
  category: TaskCategory
  assigneeIds: string[]
  dueDate: string | null
  dueTime: string | null
  dueDateChanged: boolean
  slaDays: number | null
}): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('tasks')
    .update({
      title: input.title,
      category: input.category,
      due_date: input.dueDate,
      due_time: input.dueTime,
      // Only flip the override on when this edit actually changed the
      // date — otherwise saving an unrelated field (title, assignee)
      // would freeze a perfectly fine auto-computed date by accident.
      ...(input.dueDateChanged ? { due_date_overridden: true } : {}),
      sla_days: input.slaDays,
    })
    .eq('id', id)
  if (error) throw error

  await setTaskAssignees(id, input.assigneeIds)
}

export async function resetTaskDueDateOverride(id: string): Promise<void> {
  const db = supabaseServer()
  const { error } = await db.from('tasks').update({ due_date_overridden: false }).eq('id', id)
  if (error) throw error
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('tasks')
    .update({ status, completed_at: status === 'done' ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}

// Must-have from the doc: "there should not be two places where you have
// to update the same raw information." A few checklist tasks also exist
// as a field on the linked Salesforce record — push the date across so
// nobody has to separately open Salesforce and enter it by hand. Best
// effort by design: a Salesforce hiccup here must never fail the actual
// "mark task done" click, so callers should not await this for its
// success/failure, only fire it and let it log on its own.
export async function syncTaskCompletionToSalesforce(
  taskTitle: string,
  project: Project,
  completedAt: string | null
): Promise<void> {
  const fieldApiName = SALESFORCE_WRITEBACK_FIELDS[taskTitle]
  if (!fieldApiName || !project.salesforceId) return
  try {
    await writeBackTaskDate(project.salesforceId, fieldApiName, completedAt)
  } catch (err) {
    console.error('Salesforce write-back failed', { taskTitle, projectId: project.id, fieldApiName, err })
  }
}

export interface ReminderCandidate {
  task: Task
  project: Project
  lastNotifiedStatus: 'atrisk' | 'overdue' | null
}

// Every open (not-done) task with at least one assignee, for the daily SLA
// reminder job to evaluate. Includes last_notified_status so the caller
// can tell a new escalation apart from one already emailed.
export async function getOpenTasksForReminderCheck(): Promise<ReminderCandidate[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('tasks')
    .select(`*, task_assignees!inner(people(*)), projects(*)`)
    .neq('status', 'done')
  if (error) throw error

  const rows = (data as ReminderTaskRow[]).filter((row) => row.projects !== null)
  const statsMap = await getSubtaskStatsForAll()
  return rows.map((row) => ({
    task: toTask(row, statsMap.get(row.id)),
    project: toProject(row.projects!),
    lastNotifiedStatus: row.last_notified_status,
  }))
}

export async function setTaskNotifiedStatus(
  id: string,
  status: 'atrisk' | 'overdue' | null
): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('tasks')
    .update({ last_notified_status: status, last_notified_at: status ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
}

const DAILY_LOG_SELECT = '*, people(*), daily_log_photos(url)'

export async function getDailyLogsForProject(projectId: string): Promise<DailyLog[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('daily_logs')
    .select(DAILY_LOG_SELECT)
    .eq('project_id', projectId)
    .order('log_date', { ascending: false })
  if (error) throw error
  return (data as DailyLogRow[]).map(toDailyLog)
}

export interface DailyLogWithProject {
  log: DailyLog
  project: Project
}

// For the dashboard's "Recent Daily Logs" card — most recent entries
// across every project, not scoped to one.
export async function getRecentDailyLogs(limit: number): Promise<DailyLogWithProject[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('daily_logs')
    .select(`${DAILY_LOG_SELECT}, projects(*)`)
    .order('log_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  const rows = data as (DailyLogRow & { projects: ProjectRow | null })[]
  return rows
    .filter((row) => row.projects !== null)
    .map((row) => ({ log: toDailyLog(row), project: toProject(row.projects!) }))
}

export async function getDailyLogById(id: string): Promise<DailyLog | null> {
  const db = supabaseServer()
  const { data, error } = await db.from('daily_logs').select(DAILY_LOG_SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? toDailyLog(data as DailyLogRow) : null
}

export interface DailyLogInput {
  logDate: string
  weather: string | null
  heatIndex: string | null
  dailyGoal: string | null
  personnelOnSite: string | null
  otherTradesOnSite: string | null
  visitorsOnSite: string | null
  anticipatedDelays: string | null
  delaysOrBottlenecks: string | null
  projectUpdate: string | null
  safetyIncidents: string | null
  notes: string | null
  createdBy: string | null
}

// Throws a Postgres unique-violation error (code 23505) if a log already
// exists for this project + date — callers should catch that and point
// the user at editing the existing entry instead.
export async function createDailyLog(projectId: string, input: DailyLogInput): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('daily_logs')
    .insert({
      project_id: projectId,
      log_date: input.logDate,
      weather: input.weather,
      heat_index: input.heatIndex,
      daily_goal: input.dailyGoal,
      personnel_on_site: input.personnelOnSite,
      other_trades_on_site: input.otherTradesOnSite,
      visitors_on_site: input.visitorsOnSite,
      anticipated_delays: input.anticipatedDelays,
      delays_or_bottlenecks: input.delaysOrBottlenecks,
      project_update: input.projectUpdate,
      safety_incidents: input.safetyIncidents,
      notes: input.notes,
      created_by: input.createdBy,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateDailyLog(id: string, input: Omit<DailyLogInput, 'createdBy'>): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('daily_logs')
    .update({
      log_date: input.logDate,
      weather: input.weather,
      heat_index: input.heatIndex,
      daily_goal: input.dailyGoal,
      personnel_on_site: input.personnelOnSite,
      other_trades_on_site: input.otherTradesOnSite,
      visitors_on_site: input.visitorsOnSite,
      anticipated_delays: input.anticipatedDelays,
      delays_or_bottlenecks: input.delaysOrBottlenecks,
      project_update: input.projectUpdate,
      safety_incidents: input.safetyIncidents,
      notes: input.notes,
    })
    .eq('id', id)
  if (error) throw error
}

// Storage upload happens server-side with the service-role key, so RLS on
// storage.objects never applies here — public read (bucket.public = true,
// set in the migration) is what makes the resulting URL usable directly
// in an <img>, same as a Google Photos link would be.
export async function addDailyLogPhotos(dailyLogId: string, files: File[]): Promise<void> {
  const nonEmpty = files.filter((f) => f.size > 0)
  if (nonEmpty.length === 0) return

  const db = supabaseServer()
  const urls: string[] = []
  for (const file of nonEmpty) {
    const path = `${dailyLogId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await db.storage.from('daily-log-photos').upload(path, file)
    if (uploadError) throw uploadError
    const { data } = db.storage.from('daily-log-photos').getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  const { error } = await db.from('daily_log_photos').insert(urls.map((url) => ({ daily_log_id: dailyLogId, url })))
  if (error) throw error
}

const PROJECT_EMAIL_SELECT = '*, people(*)'

export async function getProjectEmails(projectId: string): Promise<ProjectEmail[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_emails')
    .select(PROJECT_EMAIL_SELECT)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as ProjectEmailRow[]).map(toProjectEmail)
}

export interface ProjectEmailInput {
  tag: EmailTag
  subject: string | null
  content: string
  emailLink: string | null
  loggedBy: string | null
}

export async function createProjectEmail(projectId: string, input: ProjectEmailInput): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_emails')
    .insert({
      project_id: projectId,
      tag: input.tag,
      subject: input.subject,
      content: input.content,
      email_link: input.emailLink,
      logged_by: input.loggedBy,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateProjectEmail(id: string, input: Omit<ProjectEmailInput, 'loggedBy'>): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('project_emails')
    .update({
      tag: input.tag,
      subject: input.subject,
      content: input.content,
      email_link: input.emailLink,
    })
    .eq('id', id)
  if (error) throw error
}

const EMPTY_BUDGET_FIELDS = {
  engineering_sold_cost: 0, engineering_actual_cost: 0,
  material_sold_cost: 0, material_actual_cost: 0,
  labor_sold_cost: 0, labor_actual_cost: 0,
  labor_sold_hours: 0, labor_actual_hours: 0,
  electrical_sold_cost: 0, electrical_actual_cost: 0,
}

// Lazily creates a zeroed budget row the first time a project's budget
// page is opened, so the UI never has to special-case "no budget yet."
export async function getOrCreateProjectBudget(projectId: string): Promise<ProjectBudget> {
  const db = supabaseServer()
  const { data: existing, error: selectError } = await db
    .from('project_budgets')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle()
  if (selectError) throw selectError
  if (existing) return toProjectBudget(existing as ProjectBudgetRow)

  const { data: created, error: insertError } = await db
    .from('project_budgets')
    .insert({ project_id: projectId, ...EMPTY_BUDGET_FIELDS })
    .select('*')
    .single()
  if (insertError) throw insertError
  return toProjectBudget(created as ProjectBudgetRow)
}

export interface ProjectBudgetInput {
  engineeringSoldCost: number
  engineeringActualCost: number
  materialSoldCost: number
  materialActualCost: number
  laborSoldCost: number
  laborActualCost: number
  laborSoldHours: number
  laborActualHours: number
  electricalSoldCost: number
  electricalActualCost: number
}

export async function updateProjectBudget(projectId: string, input: ProjectBudgetInput): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('project_budgets')
    .update({
      engineering_sold_cost: input.engineeringSoldCost,
      engineering_actual_cost: input.engineeringActualCost,
      material_sold_cost: input.materialSoldCost,
      material_actual_cost: input.materialActualCost,
      labor_sold_cost: input.laborSoldCost,
      labor_actual_cost: input.laborActualCost,
      labor_sold_hours: input.laborSoldHours,
      labor_actual_hours: input.laborActualHours,
      electrical_sold_cost: input.electricalSoldCost,
      electrical_actual_cost: input.electricalActualCost,
    })
    .eq('project_id', projectId)
  if (error) throw error
}

// All project budgets at once, keyed by project id — used for the
// dashboard's real-time budget-variance indicator per project.
export async function getAllProjectBudgets(): Promise<Record<string, ProjectBudget>> {
  const db = supabaseServer()
  const { data, error } = await db.from('project_budgets').select('*')
  if (error) throw error
  const byProject: Record<string, ProjectBudget> = {}
  for (const row of data as ProjectBudgetRow[]) {
    byProject[row.project_id] = toProjectBudget(row)
  }
  return byProject
}

const PROJECT_EXPENSE_SELECT = '*, people(*), vendors(*)'

export async function getProjectExpenses(projectId: string): Promise<ProjectExpense[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_expenses')
    .select(PROJECT_EXPENSE_SELECT)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as ProjectExpenseRow[]).map(toProjectExpense)
}

// Every project's expenses at once — used for the dashboard variance
// indicator (actual cost = budget actual costs + expense total).
export async function getAllProjectExpenses(): Promise<Record<string, ProjectExpense[]>> {
  const db = supabaseServer()
  const { data, error } = await db.from('project_expenses').select(PROJECT_EXPENSE_SELECT)
  if (error) throw error
  const byProject: Record<string, ProjectExpense[]> = {}
  for (const row of data as ProjectExpenseRow[]) {
    const expense = toProjectExpense(row)
    byProject[expense.projectId] ??= []
    byProject[expense.projectId].push(expense)
  }
  return byProject
}

export interface ProjectExpenseInput {
  vendorId: string
  amount: number
  description: string | null
  invoiceDate: string | null
  loggedBy: string | null
}

export async function createProjectExpense(projectId: string, input: ProjectExpenseInput): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_expenses')
    .insert({
      project_id: projectId,
      vendor_id: input.vendorId,
      amount: input.amount,
      description: input.description,
      invoice_date: input.invoiceDate,
      logged_by: input.loggedBy,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

// The expense ledger is otherwise append-only (audit trail — see
// createProjectExpense), but invoice number and paid date are the one
// exception: they're naturally filled in after the expense is already
// logged, not known at the time. Nothing else about the record changes.
export async function updateProjectExpenseInvoiceNumber(id: string, invoiceNumber: string | null): Promise<void> {
  const db = supabaseServer()
  const { error } = await db.from('project_expenses').update({ invoice_number: invoiceNumber }).eq('id', id)
  if (error) throw error
}

export async function setProjectExpensePaid(id: string, paidDate: string | null): Promise<void> {
  const db = supabaseServer()
  const { error } = await db.from('project_expenses').update({ invoice_paid_date: paidDate }).eq('id', id)
  if (error) throw error
}

export async function getVendors(): Promise<Vendor[]> {
  const db = supabaseServer()
  const { data, error } = await db.from('vendors').select('*').order('name')
  if (error) throw error
  return (data as VendorRow[]).map(toVendor)
}

export interface VendorInput {
  name: string
  trade: string | null
  phone: string | null
  email: string | null
  notes: string | null
}

export async function createVendor(input: VendorInput): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('vendors')
    .insert({ name: input.name, trade: input.trade, phone: input.phone, email: input.email, notes: input.notes })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateVendor(id: string, input: VendorInput): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('vendors')
    .update({ name: input.name, trade: input.trade, phone: input.phone, email: input.email, notes: input.notes })
    .eq('id', id)
  if (error) throw error
}

export async function deleteVendor(id: string): Promise<void> {
  const db = supabaseServer()
  const { error } = await db.from('vendors').delete().eq('id', id)
  if (error) throw error
}

export async function getProjectContacts(projectId: string): Promise<ProjectContact[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_contacts')
    .select('*')
    .eq('project_id', projectId)
    .order('name')
  if (error) throw error
  return (data as ProjectContactRow[]).map(toProjectContact)
}

export interface ProjectContactInput {
  name: string
  roleDescription: string | null
  business: string | null
  phone: string | null
  otherPhone: string | null
  email: string | null
  notes: string | null
}

export async function createProjectContact(projectId: string, input: ProjectContactInput): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_contacts')
    .insert({
      project_id: projectId,
      name: input.name,
      role_description: input.roleDescription,
      business: input.business,
      phone: input.phone,
      other_phone: input.otherPhone,
      email: input.email,
      notes: input.notes,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateProjectContact(id: string, input: ProjectContactInput): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('project_contacts')
    .update({
      name: input.name,
      role_description: input.roleDescription,
      business: input.business,
      phone: input.phone,
      other_phone: input.otherPhone,
      email: input.email,
      notes: input.notes,
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteProjectContact(id: string): Promise<void> {
  const db = supabaseServer()
  const { error } = await db.from('project_contacts').delete().eq('id', id)
  if (error) throw error
}

export async function getTimeEntriesForProject(projectId: string): Promise<TimeEntry[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_time_entries')
    .select('*, people(*)')
    .eq('project_id', projectId)
    .order('work_date', { ascending: false })
  if (error) throw error
  return (data as TimeEntryRow[]).map(toTimeEntry)
}

export interface TimeEntryInput {
  personId: string
  workDate: string
  hours: number
  category: TimeEntryCategory
  notes: string | null
}

export async function createTimeEntry(projectId: string, input: TimeEntryInput): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_time_entries')
    .insert({
      project_id: projectId,
      person_id: input.personId,
      work_date: input.workDate,
      hours: input.hours,
      category: input.category,
      notes: input.notes,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

// Doc: "OPS can assign employees to the project -> Once an employee is
// assigned to a project, hours can be entered." This is the gate —
// createTimeEntryAction checks membership before calling createTimeEntry.
export async function getProjectTeamMembers(projectId: string): Promise<Person[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('project_team_members')
    .select('people(*)')
    .eq('project_id', projectId)
  if (error) throw error
  return (data as unknown as { people: PersonRow }[])
    .map((row) => row.people)
    .filter((p): p is PersonRow => p !== null)
    .map(toPerson)
}

export async function addProjectTeamMember(projectId: string, personId: string): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('project_team_members')
    .insert({ project_id: projectId, person_id: personId })
  if (error && error.code !== '23505') throw error
}

export async function removeProjectTeamMember(projectId: string, personId: string): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('project_team_members')
    .delete()
    .eq('project_id', projectId)
    .eq('person_id', personId)
  if (error) throw error
}

function addDays(isoDate: string, offsetDays: number): string {
  const date = new Date(isoDate)
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

// The actual "cascading" in "auto-cascading SLA dates": re-derives every
// rule-driven task's due_date from its anchor (a project field, another
// task's completion, or this task's first-assigned timestamp) and writes
// back only what changed. Call after anything that could move an
// anchor: project date edits, a task being marked done, or a task
// getting its first assignee.
export async function recomputeTaskDueDates(projectId: string): Promise<void> {
  const db = supabaseServer()
  const [{ data: projectRow, error: projErr }, { data: taskRows, error: taskErr }] = await Promise.all([
    db.from('projects').select('sold_install_date, projected_install_date').eq('id', projectId).single(),
    db.from('tasks').select('id, title, due_date, due_date_overridden, completed_at, first_assigned_at').eq('project_id', projectId),
  ])
  if (projErr) throw projErr
  if (taskErr) throw taskErr

  type RuleTaskRow = {
    id: string; title: string; due_date: string | null; due_date_overridden: boolean
    completed_at: string | null; first_assigned_at: string | null
  }
  const rows = taskRows as RuleTaskRow[]
  const byTitle = new Map(rows.map((r) => [r.title, r]))

  // A task_completed anchor can point at a task that itself just got
  // recomputed in this same pass — e.g. resetting "50% Plan Complete"
  // back to automatic must also push "50% Plan Set Review" forward,
  // not leave it stale until the next unrelated recompute. Looping until
  // nothing changes (capped well above the current 1-level-deep chains)
  // makes ordering within `rows` irrelevant instead of fragile.
  for (let pass = 0; pass < 5; pass++) {
    let changed = false

    for (const row of rows) {
      const rule = SLA_RULES[row.title]
      if (!rule) continue
      // A manual edit wins until the person resets it back to automatic —
      // otherwise this loop would silently overwrite it right back.
      if (row.due_date_overridden) continue

      let anchor: string | null = null
      if (rule.anchor.type === 'sold_install_date') anchor = projectRow.sold_install_date
      else if (rule.anchor.type === 'projected_install_date') anchor = projectRow.projected_install_date
      else if (rule.anchor.type === 'task_completed') {
        // Prefer the real completion date once it's actually done; until
        // then, cascade off its current due date (auto or manually
        // overridden) so downstream tasks move the moment you push this
        // one out, instead of sitting blank until it's checked off.
        const predecessor = byTitle.get(rule.anchor.taskTitle)
        anchor = predecessor?.completed_at ?? predecessor?.due_date ?? null
      }
      else if (rule.anchor.type === 'first_assigned') anchor = row.first_assigned_at

      if (!anchor) continue

      const newDueDate = addDays(anchor, rule.offsetDays)
      if (row.due_date !== newDueDate) {
        const { error } = await db.from('tasks').update({ due_date: newDueDate }).eq('id', row.id)
        if (error) throw error
        row.due_date = newDueDate
        changed = true
      }
    }

    if (!changed) break
  }
}
