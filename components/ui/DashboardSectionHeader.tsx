import Link from 'next/link'
import type { ReactNode } from 'react'

function IconBadge({ color, children }: { color: string; iconColor?: string; children: ReactNode }) {
  return (
    <span
      className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  )
}

const strokeProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const DASHBOARD_SECTION_STYLE: Record<string, { color: string; iconColor: string; icon: ReactNode }> = {
  my_tasks: {
    color: 'var(--pine)',
    iconColor: 'white',
    icon: (
      <svg {...strokeProps} color="white">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  at_risk: {
    color: '#B45309',
    iconColor: 'white',
    icon: (
      <svg {...strokeProps} color="white">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  capacity: {
    color: 'var(--pine-dark)',
    iconColor: 'white',
    icon: (
      <svg {...strokeProps} color="white">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  projects: {
    color: '#334155',
    iconColor: 'white',
    icon: (
      <svg {...strokeProps} color="white">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  daily_logs: {
    color: 'var(--bluestem)',
    iconColor: 'var(--pine-dark)',
    icon: (
      <svg {...strokeProps} color="var(--pine-dark)">
        <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
        <rect x="8" y="1" width="8" height="4" rx="1" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
      </svg>
    ),
  },
}

export default function DashboardSectionHeader({
  cardKey,
  title,
  count,
  viewAllHref,
}: {
  cardKey: keyof typeof DASHBOARD_SECTION_STYLE
  title: string
  count?: number
  viewAllHref?: string
}) {
  const style = DASHBOARD_SECTION_STYLE[cardKey]
  return (
    <div className="flex items-center justify-between gap-4 mb-3">
      <div className="flex items-center gap-3">
        <IconBadge color={style.color}>{style.icon}</IconBadge>
        <h2 className="text-lg font-semibold">
          {title}
          {count !== undefined && <span style={{ color: 'var(--faint)' }}> ({count})</span>}
        </h2>
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-sm shrink-0" style={{ color: 'var(--pine)' }}>
          View all →
        </Link>
      )}
    </div>
  )
}
