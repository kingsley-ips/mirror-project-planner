import Link from 'next/link'
import type { Project, SlaStatus } from '@/lib/types'
import type { BudgetSummary } from '@/lib/types'
import StageTracker from '@/components/StageTracker'
import { Card } from '@/components/ui/Card'
import { SlaBadge } from '@/components/ui/SlaStatus'
import BudgetVarianceBadge from '@/components/ui/BudgetVarianceBadge'

export default function ProjectCard({
  project,
  slaStatus,
  openTaskCount,
  budgetSummary,
}: {
  project: Project
  slaStatus: SlaStatus
  openTaskCount: number
  budgetSummary: BudgetSummary | null
}) {
  const hasBudgetData = budgetSummary && (budgetSummary.totalSold > 0 || budgetSummary.totalActual > 0)

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-sm transition-shadow cursor-pointer">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-base font-semibold">{project.name}</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{project.customerName}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasBudgetData && <BudgetVarianceBadge variance={budgetSummary.variance} />}
            <SlaBadge status={slaStatus} />
          </div>
        </div>
        <StageTracker currentStage={project.stage} />
        <p className="text-xs mt-3" style={{ color: 'var(--faint)' }}>
          {openTaskCount} open task{openTaskCount === 1 ? '' : 's'}
        </p>
      </Card>
    </Link>
  )
}
