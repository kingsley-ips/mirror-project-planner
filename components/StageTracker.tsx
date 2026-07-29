import { PROJECT_STAGES, type ProjectStage } from '@/lib/types'

export default function StageTracker({ currentStage }: { currentStage: ProjectStage }) {
  const currentIndex = PROJECT_STAGES.indexOf(currentStage)
  const onHold = currentStage === 'On Hold'

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
      {PROJECT_STAGES.filter((s) => s !== 'On Hold').map((stage, i) => {
        const isComplete = !onHold && i < currentIndex
        const isCurrent = !onHold && i === currentIndex
        return (
          <div key={stage} className="flex items-center gap-1 shrink-0">
            <div
              className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg"
              style={{
                backgroundColor: isCurrent ? 'var(--pine)' : 'transparent',
                color: isCurrent ? 'white' : isComplete ? 'var(--pine)' : 'var(--faint)',
              }}
            >
              <span className="text-xs font-medium whitespace-nowrap">{stage}</span>
            </div>
            {i < PROJECT_STAGES.length - 2 && (
              <span style={{ color: isComplete ? 'var(--pine)' : 'var(--border)' }}>→</span>
            )}
          </div>
        )
      })}
      {onHold && (
        <span
          className="text-xs font-semibold px-2 py-1 rounded-lg ml-2"
          style={{ backgroundColor: 'var(--status-atrisk-bg)', color: 'var(--status-atrisk-text)' }}
        >
          On Hold
        </span>
      )}
    </div>
  )
}
