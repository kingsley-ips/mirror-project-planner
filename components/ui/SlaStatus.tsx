import type { SlaStatus } from '@/lib/types'

const dotColor: Record<SlaStatus, string> = {
  ontrack: 'var(--status-ontrack-dot)',
  atrisk:  'var(--status-atrisk-dot)',
  overdue: 'var(--status-overdue-dot)',
  done:    'var(--faint)',
}

const badgeStyle: Record<SlaStatus, React.CSSProperties> = {
  ontrack: { backgroundColor: 'var(--status-ontrack-bg)', color: 'var(--status-ontrack-text)' },
  atrisk:  { backgroundColor: 'var(--status-atrisk-bg)',  color: 'var(--status-atrisk-text)' },
  overdue: { backgroundColor: 'var(--status-overdue-bg)', color: 'var(--status-overdue-text)' },
  done:    { backgroundColor: 'var(--border-subtle)',     color: 'var(--muted)' },
}

const label: Record<SlaStatus, string> = {
  ontrack: 'On Track',
  atrisk:  'Approaching SLA',
  overdue: 'Overdue',
  done:    'Done',
}

export function SlaDot({ status }: { status: SlaStatus }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
      style={{ backgroundColor: dotColor[status] }}
      title={label[status]}
    />
  )
}

export function SlaBadge({ status }: { status: SlaStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
      style={badgeStyle[status]}
    >
      <SlaDot status={status} />
      {label[status]}
    </span>
  )
}
