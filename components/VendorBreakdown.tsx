import type { VendorSpend } from '@/lib/types'
import { formatMoney } from '@/lib/format'
import { Card } from '@/components/ui/Card'

export default function VendorBreakdown({ breakdown }: { breakdown: VendorSpend[] }) {
  if (breakdown.length === 0) return null

  return (
    <Card>
      <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>By vendor</h3>
      <div className="flex flex-col gap-1">
        {breakdown.map(({ vendor, total, count }) => (
          <div key={vendor.id} className="flex items-center justify-between text-sm">
            <span>{vendor.name} <span style={{ color: 'var(--faint)' }}>({count})</span></span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{formatMoney(total)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
