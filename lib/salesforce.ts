import 'server-only'

// Client Credentials Flow — server-to-server, no per-user login. The
// Connected App's "Run As" user's permissions govern what this can see.
async function getAccessToken(): Promise<{ accessToken: string; instanceUrl: string }> {
  const instanceUrl = process.env.SALESFORCE_INSTANCE_URL
  const clientId = process.env.SALESFORCE_CONSUMER_KEY
  const clientSecret = process.env.SALESFORCE_CONSUMER_SECRET
  if (!instanceUrl || !clientId || !clientSecret) {
    throw new Error('Salesforce credentials are not configured')
  }

  const res = await fetch(`${instanceUrl}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!res.ok) {
    throw new Error(`Salesforce auth failed: ${res.status} ${await res.text()}`)
  }
  const data = await res.json()
  return { accessToken: data.access_token, instanceUrl: data.instance_url }
}

export interface SalesforceIpsProject {
  id: string
  name: string
  accountName: string | null
  contractSignedDate: string | null
  estimatedInstallDate: string | null
  stage: string | null
}

// Scoped two ways:
// - Commercial only — IPS_Project__c also holds residential PV/ESS/HVAC/
//   electrical jobs, which this app doesn't track. "Commercial" isn't
//   consistently tagged: some records use RecordType "PV-COM", but others
//   (e.g. "The Standard (Building 3) - PV COM") have no RecordType at all
//   and are only identifiable by the name ending in "COM". Checked against
//   the full 1,500+ record history — this combination has zero false
//   positives (surnames like "Newcomb" don't END in "COM") and isn't
//   hardcoded to the PV trade, so an "ESS-COM" or "HVAC-COM" would also
//   be caught if that naming convention ever gets used.
// - Recently-sold only — the object holds every job back to 2022, most
//   long since complete. Without this, every sync would try to import
//   the entire historical archive instead of the active pipeline this
//   app actually tracks.
const SOQL = `
  select Id, Name, Account__r.Name, Contract_Signed_Date__c, Estimated_Install_Date__c, Project_Stage__c
  from IPS_Project__c
  where (RecordType.DeveloperName = 'PV_COM' or Name like '%COM')
  and Contract_Signed_Date__c >= LAST_N_MONTHS:6
`.trim()

export async function fetchSalesforceIpsProjects(): Promise<SalesforceIpsProject[]> {
  const { accessToken, instanceUrl } = await getAccessToken()
  const records: any[] = []

  let path = `/services/data/v60.0/query?q=${encodeURIComponent(SOQL)}`
  while (path) {
    const res = await fetch(`${instanceUrl}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      throw new Error(`Salesforce query failed: ${res.status} ${await res.text()}`)
    }
    const page = await res.json()
    records.push(...page.records)
    path = page.done ? '' : page.nextRecordsUrl
  }

  return records.map((r) => ({
    id: r.Id,
    name: r.Name,
    accountName: r.Account__r?.Name ?? null,
    contractSignedDate: r.Contract_Signed_Date__c ?? null,
    estimatedInstallDate: r.Estimated_Install_Date__c ?? null,
    stage: r.Project_Stage__c ?? null,
  }))
}

// The doc's own Must-Haves list bans "two places to update the same
// information" — but a few Mirror checklist tasks also exist as a field
// on the Salesforce side (verified against the full field list, not
// guessed). Marking one of these done in Mirror pushes the date across,
// so nobody has to separately open Salesforce and type it in again.
export const SALESFORCE_WRITEBACK_FIELDS: Record<string, string> = {
  'Site Audit Complete': 'Date_Site_Audit_Completed__c',
  'Electrical Review': 'Electrical_Review_Completed__c',
  'BOM Approved': 'BOM_Approved__c',
}

// Best-effort by design — a Salesforce hiccup here must never block the
// actual "mark task done" click in Mirror. Callers swallow the error
// after logging it, rather than letting it fail the task update.
export async function writeBackTaskDate(
  salesforceId: string,
  fieldApiName: string,
  dateIso: string | null
): Promise<void> {
  const { accessToken, instanceUrl } = await getAccessToken()
  const res = await fetch(
    `${instanceUrl}/services/data/v60.0/sobjects/IPS_Project__c/${salesforceId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ [fieldApiName]: dateIso ? dateIso.slice(0, 10) : null }),
    }
  )
  if (!res.ok && res.status !== 204) {
    throw new Error(`Salesforce write-back failed: ${res.status} ${await res.text()}`)
  }
}
