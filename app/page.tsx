import Link from 'next/link'
import Header from '@/components/Header'
import StageTracker from '@/components/StageTracker'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SlaBadge } from '@/components/ui/SlaStatus'
import BudgetVarianceBadge from '@/components/ui/BudgetVarianceBadge'
import { getAllProjectBudgets, getAllProjectExpenses, getAllTasksByProject, getProjects } from '@/lib/db'
import { getProjectSlaStatus, getSlaStatus } from '@/lib/sla'
import { summarizeBudget } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [projects, tasksByProject, budgetsByProject, expensesByProject] = await Promise.all([
    getProjects(),
    getAllTasksByProject(),
    getAllProjectBudgets(),
    getAllProjectExpenses(),
  ])

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Stage, owner, and SLA status across every active commercial project.
            </p>
          </div>
          <Link href="/projects/new">
            <Button size="sm">+ New Project</Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {projects.map((project) => {
            const projectTasks = tasksByProject[project.id] ?? []
            const rollup = getProjectSlaStatus(
              projectTasks.map((t) => getSlaStatus(t, today))
            )
            const openTasks = projectTasks.filter((t) => t.status !== 'done')

            const budget = budgetsByProject[project.id]
            const expenses = expensesByProject[project.id] ?? []
            const budgetSummary = budget ? summarizeBudget(budget, expenses) : null
            const hasBudgetData = budgetSummary && (budgetSummary.totalSold > 0 || budgetSummary.totalActual > 0)

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h2 className="text-base font-semibold">{project.name}</h2>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>{project.customerName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasBudgetData && <BudgetVarianceBadge variance={budgetSummary.variance} />}
                      <SlaBadge status={rollup} />
                    </div>
                  </div>
                  <StageTracker currentStage={project.stage} />
                  <p className="text-xs mt-3" style={{ color: 'var(--faint)' }}>
                    {openTasks.length} open task{openTasks.length === 1 ? '' : 's'}
                  </p>
                </Card>
              </Link>
            )
          })}
          {projects.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>
              No projects yet — click &ldquo;New Project&rdquo; to add the first one.
            </p>
          )}
        </div>
      </main>
    </>
  )
}
