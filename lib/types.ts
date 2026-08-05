export type ProjectStage =
  | 'Sales'
  | 'Design'
  | 'Permitting/Utility'
  | 'Construction'
  | 'Final Deliverables'
  | 'Complete'
  | 'On Hold'

export const PROJECT_STAGES: ProjectStage[] = [
  'Sales',
  'Design',
  'Permitting/Utility',
  'Construction',
  'Final Deliverables',
  'Complete',
  'On Hold',
]

export type TaskCategory =
  | 'Pre Design'
  | 'Design'
  | 'Job Logistics'
  | 'Material Logistics'
  | 'Construction'
  | 'Project Closeout'

export type TaskStatus = 'not_started' | 'in_progress' | 'done'

export type SlaStatus = 'ontrack' | 'atrisk' | 'overdue' | 'done'

export interface Person {
  id: string
  name: string
  email: string
  team: 'Commercial' | 'OPS' | 'Design' | 'Sales' | 'Field'
  dashboardCards: DashboardCardKey[]
}

// "Dashboard view for all employees. Must be customizable" (must-have) —
// scoped to picking which pre-built cards show on your home screen,
// rather than a full drag-and-drop layout builder. Order here is the
// fixed render order; toggling only shows/hides, doesn't reorder.
export type DashboardCardKey = 'my_tasks' | 'at_risk' | 'capacity' | 'projects' | 'daily_logs'

export const DASHBOARD_CARDS: { key: DashboardCardKey; label: string; description: string }[] = [
  { key: 'my_tasks', label: 'My Open Tasks', description: "Tasks assigned to you that aren't done yet" },
  { key: 'at_risk', label: 'At-Risk / Overdue', description: 'Every task across every project approaching or past its deadline' },
  { key: 'capacity', label: 'Team Capacity', description: 'Open / at-risk / overdue task counts per person' },
  { key: 'projects', label: 'All Projects', description: 'Every commercial project with its stage and SLA status' },
  { key: 'daily_logs', label: 'Recent Daily Logs', description: 'The latest site logs across every project' },
]

export const DEFAULT_DASHBOARD_CARDS: DashboardCardKey[] = DASHBOARD_CARDS.map((c) => c.key)

export function isDashboardCardKey(value: string): value is DashboardCardKey {
  return DASHBOARD_CARDS.some((c) => c.key === value)
}

export interface Project {
  id: string
  name: string
  customerName: string
  stage: ProjectStage
  soldInstallDate: string | null
  projectedInstallDate: string | null
  googleDriveFolderUrl: string | null
  googlePhotosFolderUrl: string | null
  createdAt: string
  salesforceId: string | null
}

export interface Task {
  id: string
  projectId: string
  title: string
  category: TaskCategory
  assignees: Person[]
  dueDate: string | null
  dueTime: string | null
  slaDays: number | null
  status: TaskStatus
  completedAt: string | null
  parentTaskId: string | null
  subtaskCount: number
  incompleteSubtaskCount: number
}

export function isTaskBlocked(task: Task): boolean {
  return task.incompleteSubtaskCount > 0
}

// Tasks store due time as a plain "HH:MM" (24h) string from <input
// type="time">, separate from the SLA-computed due_date — formatted here
// once so every row/card that displays it stays consistent.
export function formatDueTime(time: string | null): string | null {
  if (!time) return null
  const [hourStr, minute] = time.split(':')
  const hour = Number(hourStr)
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minute} ${period}`
}

export interface DailyLog {
  id: string
  projectId: string
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
  createdBy: Person | null
  createdAt: string
  photoUrls: string[]
}

export type EmailTag = 'Internal' | 'Vendor' | 'Owner' | 'GC' | 'Other'

export const EMAIL_TAGS: EmailTag[] = ['Internal', 'Vendor', 'Owner', 'GC', 'Other']

export interface ProjectEmail {
  id: string
  projectId: string
  tag: EmailTag
  subject: string | null
  content: string
  emailLink: string | null
  loggedBy: Person | null
  createdAt: string
}

export interface ProjectBudget {
  projectId: string
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
  updatedAt: string
}

export interface Vendor {
  id: string
  name: string
  trade: string | null
  phone: string | null
  email: string | null
  notes: string | null
}

export interface ProjectExpense {
  id: string
  projectId: string
  vendor: Vendor
  amount: number
  description: string | null
  invoiceDate: string | null
  invoiceNumber: string | null
  invoicePaidDate: string | null
  loggedBy: Person | null
  createdAt: string
}

export interface VendorSpend {
  vendor: Vendor
  total: number
  count: number
}

export function summarizeVendorSpend(expenses: ProjectExpense[]): VendorSpend[] {
  const byVendor = new Map<string, VendorSpend>()
  for (const expense of expenses) {
    const existing = byVendor.get(expense.vendor.id)
    if (existing) {
      existing.total += expense.amount
      existing.count += 1
    } else {
      byVendor.set(expense.vendor.id, { vendor: expense.vendor, total: expense.amount, count: 1 })
    }
  }
  return Array.from(byVendor.values()).sort((a, b) => b.total - a.total)
}

export interface BudgetSummary {
  totalSold: number
  totalActualCost: number
  totalExpenses: number
  totalActual: number
  variance: number
}

export function summarizeBudget(budget: ProjectBudget, expenses: ProjectExpense[]): BudgetSummary {
  const totalSold =
    budget.engineeringSoldCost + budget.materialSoldCost + budget.laborSoldCost + budget.electricalSoldCost
  const totalActualCost =
    budget.engineeringActualCost + budget.materialActualCost + budget.laborActualCost + budget.electricalActualCost
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalActual = totalActualCost + totalExpenses

  return { totalSold, totalActualCost, totalExpenses, totalActual, variance: totalActual - totalSold }
}

export interface ProjectContact {
  id: string
  projectId: string
  name: string
  roleDescription: string | null
  business: string | null
  phone: string | null
  otherPhone: string | null
  email: string | null
  notes: string | null
}

export type TimeEntryCategory = 'Install' | 'Electrical'

export const TIME_ENTRY_CATEGORIES: TimeEntryCategory[] = ['Install', 'Electrical']

export interface TimeEntry {
  id: string
  projectId: string
  person: Person
  workDate: string
  hours: number
  category: TimeEntryCategory
  notes: string | null
  createdAt: string
}

export interface TimeSummary {
  installTotalHours: number
  electricalTotalHours: number
  totalHours: number
  byPerson: { person: Person; hours: number }[]
}

export function summarizeTimeEntries(entries: TimeEntry[]): TimeSummary {
  const installTotalHours = entries.filter((e) => e.category === 'Install').reduce((sum, e) => sum + e.hours, 0)
  const electricalTotalHours = entries.filter((e) => e.category === 'Electrical').reduce((sum, e) => sum + e.hours, 0)

  const byPersonMap = new Map<string, { person: Person; hours: number }>()
  for (const entry of entries) {
    const existing = byPersonMap.get(entry.person.id)
    if (existing) existing.hours += entry.hours
    else byPersonMap.set(entry.person.id, { person: entry.person, hours: entry.hours })
  }
  const byPerson = Array.from(byPersonMap.values()).sort((a, b) => a.person.name.localeCompare(b.person.name))

  return {
    installTotalHours,
    electricalTotalHours,
    totalHours: installTotalHours + electricalTotalHours,
    byPerson,
  }
}

export interface ProjectStageHistory {
  id: string
  projectId: string
  stage: ProjectStage
  enteredAt: string
}

export interface LifecycleSummary {
  daysByStage: { stage: ProjectStage; days: number }[]
  daysSinceStart: number
  totalLifecycleDays: number | null
}

function roundDays(ms: number): number {
  return Math.round((ms / (1000 * 60 * 60 * 24)) * 10) / 10
}

// "Days in each stage" + "closed-won to PTO" reduced to what we actually
// track: stage-transition timestamps, not the doc's finer sub-milestones
// (permit submittal, jurisdiction, final inspection, PTO) which aren't
// distinct stages in this app. totalLifecycleDays is null until a
// project reaches Complete.
export function summarizeLifecycle(history: ProjectStageHistory[], now: Date): LifecycleSummary {
  const sorted = [...history].sort((a, b) => a.enteredAt.localeCompare(b.enteredAt))

  const daysByStageMap = new Map<ProjectStage, number>()
  for (let i = 0; i < sorted.length; i++) {
    const start = new Date(sorted[i].enteredAt)
    const end = i + 1 < sorted.length ? new Date(sorted[i + 1].enteredAt) : now
    const ms = Math.max(0, end.getTime() - start.getTime())
    daysByStageMap.set(sorted[i].stage, (daysByStageMap.get(sorted[i].stage) ?? 0) + ms)
  }

  const daysByStage = PROJECT_STAGES
    .filter((stage) => daysByStageMap.has(stage))
    .map((stage) => ({ stage, days: roundDays(daysByStageMap.get(stage)!) }))

  const firstEntered = sorted.length > 0 ? new Date(sorted[0].enteredAt) : now
  const daysSinceStart = roundDays(now.getTime() - firstEntered.getTime())

  const completeEntry = sorted.find((h) => h.stage === 'Complete')
  const totalLifecycleDays = completeEntry
    ? roundDays(new Date(completeEntry.enteredAt).getTime() - firstEntered.getTime())
    : null

  return { daysByStage, daysSinceStart, totalLifecycleDays }
}
