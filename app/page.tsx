import Link from 'next/link'
import Header from '@/components/Header'
import ProjectCard from '@/components/ProjectCard'
import WorkloadTaskRow from '@/components/WorkloadTaskRow'
import DashboardCustomizer from '@/components/DashboardCustomizer'
import DashboardSectionHeader from '@/components/ui/DashboardSectionHeader'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { getActivePersonId } from '@/lib/activePerson'
import {
  getAllProjectBudgets,
  getAllProjectExpenses,
  getAllTasksByProject,
  getAllTasksFlat,
  getPeople,
  getPersonById,
  getProjects,
  getRecentDailyLogs,
} from '@/lib/db'
import { getProjectSlaStatus, getSlaStatus } from '@/lib/sla'
import { DEFAULT_DASHBOARD_CARDS, summarizeBudget } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const activePersonId = await getActivePersonId()
  const activePerson = activePersonId ? await getPersonById(activePersonId) : null
  const enabledCards = new Set(activePerson?.dashboardCards ?? DEFAULT_DASHBOARD_CARDS)

  const [projects, tasksByProject, budgetsByProject, expensesByProject, allTasksFlat, recentLogs, people] =
    await Promise.all([
      getProjects(),
      getAllTasksByProject(),
      getAllProjectBudgets(),
      getAllProjectExpenses(),
      getAllTasksFlat(),
      enabledCards.has('daily_logs') ? getRecentDailyLogs(8) : Promise.resolve([]),
      enabledCards.has('capacity') ? getPeople() : Promise.resolve([]),
    ])

  const withStatus = allTasksFlat.map((t) => ({ ...t, slaStatus: getSlaStatus(t.task, today) }))

  const myOpenTasks = activePerson
    ? withStatus.filter((t) => t.task.status !== 'done' && t.task.assignees.some((a) => a.id === activePerson.id))
    : []

  const atRisk = withStatus
    .filter((t) => t.slaStatus === 'atrisk' || t.slaStatus === 'overdue')
    .sort((a, b) => (a.slaStatus === b.slaStatus ? 0 : a.slaStatus === 'overdue' ? -1 : 1))

  const capacity = people.map((p) => {
    const mine = withStatus.filter((t) => t.task.status !== 'done' && t.task.assignees.some((a) => a.id === p.id))
    return {
      person: p,
      open: mine.length,
      atrisk: mine.filter((t) => t.slaStatus === 'atrisk').length,
      overdue: mine.filter((t) => t.slaStatus === 'overdue').length,
    }
  })
  const unassignedOpen = withStatus.filter((t) => t.task.status !== 'done' && t.task.assignees.length === 0)

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Stage, owner, and SLA status across every active commercial project.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DashboardCustomizer
              enabledCards={activePerson?.dashboardCards ?? DEFAULT_DASHBOARD_CARDS}
              hasActivePerson={!!activePerson}
            />
            <Link href="/projects/new">
              <Button size="sm">+ New Project</Button>
            </Link>
          </div>
        </div>

        {enabledCards.has('my_tasks') && activePerson && (
          <div className="mb-8">
            <DashboardSectionHeader cardKey="my_tasks" title="My Open Tasks" count={myOpenTasks.length} viewAllHref="/my-tasks" />
            <div className="flex flex-col gap-2">
              {myOpenTasks.slice(0, 6).map(({ task, project, slaStatus }) => (
                <WorkloadTaskRow key={task.id} task={task} project={project} slaStatus={slaStatus} />
              ))}
              {myOpenTasks.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--faint)' }}>Nothing open — you&rsquo;re all caught up.</p>
              )}
            </div>
          </div>
        )}

        {enabledCards.has('at_risk') && (
          <div className="mb-8">
            <DashboardSectionHeader cardKey="at_risk" title="At-Risk / Overdue" count={atRisk.length} viewAllHref="/tasks" />
            <div className="flex flex-col gap-2">
              {atRisk.slice(0, 6).map(({ task, project, slaStatus }) => (
                <WorkloadTaskRow key={task.id} task={task} project={project} slaStatus={slaStatus} />
              ))}
              {atRisk.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--faint)' }}>Nothing at risk right now.</p>
              )}
            </div>
          </div>
        )}

        {enabledCards.has('capacity') && (
          <div className="mb-8">
            <DashboardSectionHeader cardKey="capacity" title="Team Capacity" />
            <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: 'var(--faint)' }} className="text-left text-xs">
                    <th className="pb-2 font-medium">Person</th>
                    <th className="pb-2 font-medium">Open</th>
                    <th className="pb-2 font-medium">At risk</th>
                    <th className="pb-2 font-medium">Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {capacity.map((row) => (
                    <tr key={row.person.id} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td className="py-1.5">{row.person.name}</td>
                      <td className="py-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>{row.open}</td>
                      <td className="py-1.5" style={{ fontVariantNumeric: 'tabular-nums', color: row.atrisk > 0 ? 'var(--status-atrisk-text)' : undefined }}>
                        {row.atrisk}
                      </td>
                      <td className="py-1.5" style={{ fontVariantNumeric: 'tabular-nums', color: row.overdue > 0 ? 'var(--status-overdue-text)' : undefined }}>
                        {row.overdue}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td className="py-1.5" style={{ color: 'var(--faint)' }}>Unassigned</td>
                    <td className="py-1.5" style={{ fontVariantNumeric: 'tabular-nums' }}>{unassignedOpen.length}</td>
                    <td className="py-1.5">—</td>
                    <td className="py-1.5">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            </Card>
          </div>
        )}

        {enabledCards.has('projects') && (
          <div className="mb-8">
            <DashboardSectionHeader cardKey="projects" title="All Projects" count={projects.length} viewAllHref="/projects" />
            <div className="flex flex-col gap-4">
              {projects.map((project) => {
                const projectTasks = tasksByProject[project.id] ?? []
                const rollup = getProjectSlaStatus(projectTasks.map((t) => getSlaStatus(t, today)))
                const openTaskCount = projectTasks.filter((t) => t.status !== 'done').length

                const budget = budgetsByProject[project.id]
                const expenses = expensesByProject[project.id] ?? []
                const budgetSummary = budget ? summarizeBudget(budget, expenses) : null

                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    slaStatus={rollup}
                    openTaskCount={openTaskCount}
                    budgetSummary={budgetSummary}
                  />
                )
              })}
              {projects.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--faint)' }}>
                  No projects yet — click &ldquo;New Project&rdquo; to add the first one.
                </p>
              )}
            </div>
          </div>
        )}

        {enabledCards.has('daily_logs') && (
          <div className="mb-8">
            <DashboardSectionHeader cardKey="daily_logs" title="Recent Daily Logs" />
            <div className="flex flex-col gap-2">
              {recentLogs.map(({ log, project }) => (
                <Card key={log.id} padded>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Link href={`/projects/${project.id}/logs`} className="text-sm font-medium hover:underline" style={{ color: 'var(--pine)' }}>
                        {project.name}
                      </Link>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--faint)' }}>
                        {log.logDate}{log.dailyGoal ? ` · ${log.dailyGoal}` : ''}
                      </p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--faint)' }}>
                      {log.createdBy?.name ?? 'Unknown'}
                    </span>
                  </div>
                </Card>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--faint)' }}>No daily logs yet.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
