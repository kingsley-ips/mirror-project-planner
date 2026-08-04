// The 9 cascading-date rules from the original one-pager's asterisked
// notes. Keyed by task title (must match lib/taskTemplates.ts exactly).
// Everything else in the standard checklist has no defined SLA yet —
// leave it alone rather than inventing a number.
//
// "Loading Plan Complete" and "Safety Plan / JHA" both say "45 days from
// Projected Install date" without "prior to" in one spot, but Safety
// Plan/JHA is explicit elsewhere in the doc ("45 days prior to Projected
// Install date") for the same figure — reading both as *before* the
// install date, not after, since they're prep work that has to happen
// ahead of construction.

export type SlaAnchor =
  | { type: 'sold_install_date' }
  | { type: 'projected_install_date' }
  | { type: 'task_completed'; taskTitle: string }
  | { type: 'first_assigned' }

export interface SlaRule {
  anchor: SlaAnchor
  offsetDays: number
}

export const SLA_RULES: Record<string, SlaRule> = {
  'Site Audit Complete': { anchor: { type: 'sold_install_date' }, offsetDays: 14 },
  'Site Audit Report': { anchor: { type: 'task_completed', taskTitle: 'Site Audit Complete' }, offsetDays: 2 },
  'Site Audit Photos Uploaded': { anchor: { type: 'task_completed', taskTitle: 'Site Audit Complete' }, offsetDays: 2 },
  '50% Plan Complete': { anchor: { type: 'sold_install_date' }, offsetDays: 45 },
  '50% Plan Set Review': { anchor: { type: 'task_completed', taskTitle: '50% Plan Complete' }, offsetDays: 5 },
  '100% Plan Set Review': { anchor: { type: 'sold_install_date' }, offsetDays: 60 },
  'Electrical Review': { anchor: { type: 'first_assigned' }, offsetDays: 5 },
  'Loading Plan Complete': { anchor: { type: 'projected_install_date' }, offsetDays: -45 },
  'Safety Plan / JHA': { anchor: { type: 'projected_install_date' }, offsetDays: -45 },
}

export function hasSlaRule(taskTitle: string): boolean {
  return taskTitle in SLA_RULES
}
