import 'server-only'
import { supabaseServer } from './supabase/server'
import type { DailyLog, EmailTag, Person, Project, ProjectBudget, ProjectContact, ProjectEmail, ProjectExpense, ProjectStage, ProjectStageHistory, Task, TaskCategory, TaskStatus, TimeEntry, TimeEntryCategory } from './types'

type PersonRow = { id: string; name: string; email: string; team: Person['team'] }
type ProjectRow = {
  id: string; name: string; customer_name: string; stage: ProjectStage
  sold_install_date: string | null; projected_install_date: string | null
  google_drive_folder_url: string | null; google_photos_folder_url: string | null
  created_at: string
}
type TaskRow = {
  id: string; project_id: string; title: string; category: TaskCategory
  due_date: string | null; sla_days: number | null
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

type ProjectExpenseRow = {
  id: string; project_id: string; vendor_name: string; amount: string
  description: string | null; invoice_date: string | null; created_at: string
  people: PersonRow | null
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
  return { id: row.id, name: row.name, email: row.email, team: row.team }
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

function toProjectExpense(row: ProjectExpenseRow): ProjectExpense {
  return {
    id: row.id,
    projectId: row.project_id,
    vendorName: row.vendor_name,
    amount: Number(row.amount),
    description: row.description,
    invoiceDate: row.invoice_date,
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
async function getSubtaskStatsMap(taskIds: string[]): Promise<Map<string, SubtaskStats>> {
  const map = new Map<string, SubtaskStats>()
  if (taskIds.length === 0) return map

  const db = supabaseServer()
  const { data, error } = await db.from('tasks').select('parent_task_id, status').in('parent_task_id', taskIds)
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
  const stats = await getSubtaskStatsMap([id])
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
  const statsMap = await getSubtaskStatsMap(rows.map((r) => r.id))
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
  const statsMap = await getSubtaskStatsMap(rows.map((r) => r.id))
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

  const statsMap = await getSubtaskStatsMap(rows.map((r) => r.id))
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
}): Promise<string> {
  const db = supabaseServer()
  const { data, error } = await db
    .from('people')
    .insert({ name: input.name, email: input.email, team: input.team })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updatePerson(id: string, input: {
  name: string
  email: string
  team: Person['team']
}): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('people')
    .update({ name: input.name, email: input.email, team: input.team })
    .eq('id', id)
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
    })
    .select('id')
    .single()
  if (error) throw error

  const { error: historyError } = await db
    .from('project_stage_history')
    .insert({ project_id: data.id, stage: input.stage })
  if (historyError) throw historyError

  return data.id
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
}

export async function createTask(input: {
  projectId: string
  title: string
  category: TaskCategory
  assigneeIds: string[]
  dueDate: string | null
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
  slaDays: number | null
}): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('tasks')
    .update({
      title: input.title,
      category: input.category,
      due_date: input.dueDate,
      sla_days: input.slaDays,
    })
    .eq('id', id)
  if (error) throw error

  await setTaskAssignees(id, input.assigneeIds)
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const db = supabaseServer()
  const { error } = await db
    .from('tasks')
    .update({ status, completed_at: status === 'done' ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) throw error
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
  const statsMap = await getSubtaskStatsMap(rows.map((r) => r.id))
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

const DAILY_LOG_SELECT = '*, people(*)'

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

const PROJECT_EXPENSE_SELECT = '*, people(*)'

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

export async function getVendorNameSuggestions(): Promise<string[]> {
  const db = supabaseServer()
  const { data, error } = await db.from('project_expenses').select('vendor_name')
  if (error) throw error
  return Array.from(new Set((data as { vendor_name: string }[]).map((r) => r.vendor_name))).sort()
}

export interface ProjectExpenseInput {
  vendorName: string
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
      vendor_name: input.vendorName,
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
