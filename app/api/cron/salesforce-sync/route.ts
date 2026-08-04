import { NextRequest, NextResponse } from 'next/server'
import { syncSalesforceProjects } from '@/lib/db'

// New-project creation (project row + ~38 checklist tasks + SLA recompute)
// runs at a few seconds each — the per-run cap in syncSalesforceProjects
// keeps this well under 60s in practice, but this raises the ceiling in
// case Salesforce or Supabase responds slower than usual on a given run.
export const maxDuration = 60

// Runs on a schedule (see vercel.json). Pulls every IPS_Project__c record
// from Salesforce and mirrors it in: creates new projects, updates
// stage/dates on ones already linked (matched by salesforce_id).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const result = await syncSalesforceProjects()
  return NextResponse.json(result)
}
