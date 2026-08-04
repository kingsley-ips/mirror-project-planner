'use client'

import { useState } from 'react'
import type { Vendor } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import VendorForm from '@/components/VendorForm'
import { deleteVendorAction } from '@/app/actions'

export default function VendorRow({ vendor }: { vendor: Vendor }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <VendorForm existing={vendor} onCancel={() => setEditing(false)} />
  }

  return (
    <Card padded className="flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">
          {vendor.name}
          {vendor.trade && <span className="ml-2 text-xs font-normal" style={{ color: 'var(--faint)' }}>{vendor.trade}</span>}
        </p>
        <p className="text-xs mt-0.5 flex flex-wrap gap-x-3" style={{ color: 'var(--faint)' }}>
          {vendor.phone && (
            <a href={`tel:${vendor.phone}`} className="hover:underline" style={{ color: 'var(--pine)' }}>{vendor.phone}</a>
          )}
          {vendor.email && (
            <a href={`mailto:${vendor.email}`} className="hover:underline" style={{ color: 'var(--pine)' }}>{vendor.email}</a>
          )}
          {!vendor.phone && !vendor.email && !vendor.trade && 'No contact info yet'}
        </p>
        {vendor.notes && <p className="text-xs mt-1" style={{ color: 'var(--faint)' }}>{vendor.notes}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm(`Remove ${vendor.name}? This only works if no expenses have been logged against them yet.`)) {
              deleteVendorAction(vendor.id)
            }
          }}
        >
          Remove
        </Button>
      </div>
    </Card>
  )
}
