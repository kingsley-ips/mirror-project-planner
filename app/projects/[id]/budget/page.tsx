import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import BudgetSummary from '@/components/BudgetSummary'
import VendorBreakdown from '@/components/VendorBreakdown'
import ProjectBudgetForm from '@/components/ProjectBudgetForm'
import ProjectExpenseForm from '@/components/ProjectExpenseForm'
import ProjectExpenseRow from '@/components/ProjectExpenseRow'
import { getOrCreateProjectBudget, getProjectById, getProjectExpenses, getVendors } from '@/lib/db'
import { summarizeBudget, summarizeVendorSpend } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProjectBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, budget, expenses, vendors] = await Promise.all([
    getProjectById(id),
    getOrCreateProjectBudget(id),
    getProjectExpenses(id),
    getVendors(),
  ])
  if (!project) notFound()

  const summary = summarizeBudget(budget, expenses)
  const vendorBreakdown = summarizeVendorSpend(expenses)

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <Link href={`/projects/${project.id}`} className="text-sm" style={{ color: 'var(--pine)' }}>
          ← {project.name}
        </Link>
        <h1 className="text-2xl font-semibold mt-3 mb-1">Budget</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
          Manual entry — sold vs. actual cost per category, plus a running expense ledger.
        </p>

        <div className="mb-6">
          <BudgetSummary summary={summary} />
        </div>

        <h2 className="text-lg font-semibold mb-3">Job Costing</h2>
        <div className="mb-6">
          <ProjectBudgetForm projectId={project.id} budget={budget} />
        </div>

        <h2 className="text-lg font-semibold mb-3">Expenses / Vendor Invoicing</h2>
        {vendorBreakdown.length > 0 && (
          <div className="mb-4">
            <VendorBreakdown breakdown={vendorBreakdown} />
          </div>
        )}
        <div className="mb-4">
          <ProjectExpenseForm projectId={project.id} vendors={vendors} />
        </div>
        <div className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <ProjectExpenseRow key={expense.id} expense={expense} />
          ))}
          {expenses.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--faint)' }}>No expenses logged yet.</p>
          )}
        </div>
      </main>
    </>
  )
}
