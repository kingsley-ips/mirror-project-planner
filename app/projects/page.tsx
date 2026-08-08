import Link from 'next/link'
import Header from '@/components/Header'
import ProjectCard from '@/components/ProjectCard'
import Button from '@/components/ui/Button'
import { getAllProjectBudgets, getAllProjectExpenses, getAllTasksByProject, getProjects } from '@/lib/db'
import { getProjectSlaStatus, getSlaStatus } from '@/lib/sla'
import { summarizeBudget } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
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
              Every commercial project, with its stage and SLA status.
            </p>
          </div>
          <Link href="/projects/new">
            <Button size="sm">+ New Project</Button>
          </Link>
        </div>

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
      </main>
    </>
  )
}
