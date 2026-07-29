import type { ProjectBudget } from '@/lib/types'
import Button from '@/components/ui/Button'
import { updateProjectBudgetAction } from '@/app/actions'

function NumberField({ name, defaultValue, label }: { name: string; defaultValue: number; label: string }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <input type="number" name={name} step="0.01" min="0" defaultValue={defaultValue} className="input" />
    </label>
  )
}

export default function ProjectBudgetForm({ projectId, budget }: { projectId: string; budget: ProjectBudget }) {
  const action = updateProjectBudgetAction.bind(null, projectId)

  return (
    <form action={action} className="flex flex-col gap-4 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <div>
        <h3 className="text-sm font-semibold mb-2">Engineering</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberField name="engineeringSoldCost" label="Sold Cost" defaultValue={budget.engineeringSoldCost} />
          <NumberField name="engineeringActualCost" label="Actual Cost" defaultValue={budget.engineeringActualCost} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Material</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberField name="materialSoldCost" label="Sold Cost" defaultValue={budget.materialSoldCost} />
          <NumberField name="materialActualCost" label="Actual Cost" defaultValue={budget.materialActualCost} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Labor</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberField name="laborSoldCost" label="Sold Cost" defaultValue={budget.laborSoldCost} />
          <NumberField name="laborActualCost" label="Actual Cost" defaultValue={budget.laborActualCost} />
          <NumberField name="laborSoldHours" label="Sold Hours" defaultValue={budget.laborSoldHours} />
          <NumberField name="laborActualHours" label="Actual Hours" defaultValue={budget.laborActualHours} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2">Electrical</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumberField name="electricalSoldCost" label="Sold Cost" defaultValue={budget.electricalSoldCost} />
          <NumberField name="electricalActualCost" label="Actual Cost" defaultValue={budget.electricalActualCost} />
        </div>
      </div>

      <div>
        <Button type="submit" size="sm">Save Budget</Button>
      </div>
    </form>
  )
}
