# Mirror Project Planner

Commercial project tracking for Independent Power — Phase 1.

Replaces spreadsheets/memory for tracking commercial solar project stage, task
ownership, and SLA status. Standalone project for now; intended to eventually
fold into `ip-toolbox-platform` (shared login + access control) once this
proves out.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres) · Vercel

**⚠️ LIVE AND PUBLIC — READ THIS:** deployed at https://mirror.solarips.com
(and https://mirror-project-planner.vercel.app) with **no login and no
Cloudflare Access gate**. Cloudflare Access setup was started but
deliberately paused (see "Deployment" section below) — anyone with either
URL can currently read and write every project, task, budget, and email
in the shared database. Finish Cloudflare Access or build real in-app
auth before treating this as anything other than an active, live risk.

## Phase 1 scope (this build)

- Project list with stage tracker (Sales → Design → Permitting/Utility →
  Construction → Final Deliverables → Complete / On Hold)
- Task list per project: title, category, owner, due date
- Red/yellow/green SLA stoplight per task, rolled up to a project-level badge
- Link out to the customer's Google Drive folder
- Create projects, create tasks, change project stage, and mark tasks
  done/reopen — all persisted to Supabase (no more mock data)
- Edit an existing task (title, category, owner, due date, SLA days)
- Email the assignee when a task is created with an owner, or reassigned to
  someone new (via Resend)
- People management (`/people`): add, edit, and remove team members —
  no more editing Supabase by hand to onboard someone new. Removing a
  person just unassigns their tasks (doesn't delete the tasks).
- "My Tasks" (`/my-tasks`): a personalized view of everything assigned to
  one person across every project, sorted overdue-first. Since there's no
  real login yet, it asks "who are you?" once and remembers the answer in
  a cookie (`lib/activePerson.ts`) — a stand-in for real auth, swap for an
  actual session once this folds into `ip-toolbox-platform`.
- Daily SLA reminder job (`/api/cron/sla-reminders`, scheduled via
  `vercel.json`): emails the owner once when a task first crosses into
  "at risk" and once when it crosses into "overdue" — not a daily nag,
  and it resets if the task comes back on track (e.g. due date pushed out)
- **Multiple assignees per task** (`task_assignees` join table, migration
  `003`) — a task can have zero, one, or many owners
- **Sub-tasks** (`tasks.parent_task_id`, self-referencing) — a task with
  incomplete sub-tasks is "blocked": the status control is replaced with
  a "Blocked (N subtasks left)" badge, and `updateTaskStatusAction` refuses
  the update server-side even if the UI is bypassed
- **Standard task checklist** (`lib/taskTemplates.ts`) — "+ Add standard
  task checklist" on a project bulk-creates the required-task list from
  the original one-pager (Pre Design/Design/Job Logistics/Material
  Logistics/Construction/Project Closeout), skipping any titles already
  present so it's safe to click more than once. Assignment of "the
  appropriate party" per task is still a human decision — there's no
  fixed role-to-task mapping to automate that part.
- **Google Photos folder link** — same treatment as the Drive folder link
  (set at project creation, shown on the project detail page)
- **All Tasks** (`/tasks`) — org-wide workload view: a capacity table
  (open/at-risk/overdue count per person, plus an Unassigned row) and a
  filterable task list (by status, by person, or unassigned-only)
- **My Tasks sort control** — "customizable dashboard" scoped down to a
  sort-by toggle (urgency / project / due date) via `?sort=` query param
- **Daily Logs** (`/projects/[id]/logs`) — one entry per project per day
  (enforced by a DB unique constraint), attributed to whoever's set as the
  active person (same "who are you" cookie as My Tasks). Covers weather,
  heat index, daily goal, personnel/other trades/visitors on site,
  delays, safety incidents, and notes. Photos aren't uploaded here —
  each entry just points back at the project's existing Google Photos
  folder link rather than standing up a separate file-storage pipeline.
- **Communications** (`/projects/[id]/communications`) — this is what the
  doc called "Vendor and Subcontractor Management," but it's really a
  Chatter-style log: paste an email onto a project, tag it (Internal /
  Vendor / Owner / GC / Other), optionally link back to the original,
  then filter by tag or search subject/content later. Not a structured
  vendor database — that's the separate, still-unbuilt Contacts section.
- **Budget / Job Costing** (`/projects/[id]/budget`) — manual-entry ledger,
  per the doc's own note that this can be manual. Sold vs. actual cost for
  the four named categories (Engineering, Material, Labor + hours,
  Electrical), plus a running expenses/vendor-invoicing ledger (vendor
  name with autocomplete from prior entries, amount, description, invoice
  date — append-only, no edit, since a financial log should stay an audit
  trail rather than something anyone can silently rewrite). A summary
  card shows Total Sold vs. Total Actual (the four actual costs + the
  expense ledger total) and the variance, color-coded over/under. The
  same variance shows on each project's dashboard card in real time, per
  the doc's explicit ask — only once a project actually has budget data
  entered, so untouched projects don't show a misleading "$0 over."
- **Contacts** (`/projects/[id]/contacts`) — per-project cards for GC, EC,
  roofer, owner, whoever's relevant, with a free-text role (not a fixed
  dropdown, per Whitney's note), business, two phone numbers, email, and
  notes. Phone/email render as `tel:`/`mailto:` links. Freely
  editable/removable, unlike the expense ledger — these are just
  reference info, not a financial record.
- **Time Tracking** (`/projects/[id]/time`) — the doc's "Gusto" time
  tracking, minus the actual Gusto API pull (no credentials for that;
  swap the employee source later if that shows up). Log hours per
  person per project, categorized Install or Electrical, append-only
  (same audit-trail reasoning as the expense ledger). A summary shows
  Install Total / Electrical Total / Project Total plus a per-person
  breakdown.
- **Lifecycle** (`/projects/[id]/lifecycle`) — the doc's day-count
  metrics (days in engineering, closed-won to PTO, etc.), reduced to
  what's actually trackable: our 7 stages are coarser than the doc's
  specific sub-milestones (permit submittal, jurisdiction, final
  inspection, PTO aren't separate stages here), so this shows **days
  spent in each stage** and **total lifecycle time** (Sales → Complete,
  shown as "In progress" until a project actually reaches Complete).
  Backed by a new `project_stage_history` table recording every stage
  transition with a timestamp — existing projects were backfilled with
  a single starting entry (their current stage, dated to project
  creation), so historical stage-by-stage detail before this feature
  existed isn't available, but everything going forward is exact.

**✅ Resend domain verified (2026-07-27):** `notify.solarips.com` is verified
in Resend (DKIM + SPF records added in Cloudflare, DNS-only, no proxy).
`EMAIL_FROM` now sends from `notifications@notify.solarips.com` — real
delivery to anyone, not just the account owner. Confirmed via a live test
send and a real cron run (both previously-blocked reminders — Whitney's
Crane Scheduled, Jordan's Structural Letter — went through with zero
failures).

**Not built yet:** the Gantt chart + cascading SLA dates — the one item
still genuinely blocked, waiting on Kenny's per-task SLA duration list.
Everything else from the original one-pager is built. Also still
deliberately deferred: Salesforce sync (held for the `ip-toolbox-platform`
level instead of duplicated here) and real auth (currently no login —
anyone who can reach the dev server can read/write everything — pending
a decision on folding this into `ip-toolbox-platform`).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 (or whatever port is free — see note below).

## Deployment

Live in production on Vercel (team `independent-power`, project
`mirror-project-planner`):
- https://mirror.solarips.com (custom domain, Cloudflare A record →
  `76.76.21.21`, proxied)
- https://mirror-project-planner.vercel.app (default Vercel domain)

Source is on GitHub at `github.com/kingsley-ips/mirror-project-planner`
(personal account — the original plan was the `Independent-Power` org;
easy to transfer later via GitHub's repo settings if wanted).

Production env vars (Supabase, Resend, cron secret, site URL) are set
directly in the Vercel project settings — same values as `.env.local`.

**Cloudflare Access was started but not finished.** The plan was a
Self-hosted Access application on `mirror.solarips.com` restricting
sign-in to `@solarips.com` emails, matching how `ip-toolbox-platform`
gates `toolbox.solarips.com`. Zero Trust's free tier needed a card on
file for verification; the user chose to skip that for now rather than
enter one. **Until Access is finished (or real in-app auth exists),
this URL is genuinely public with no access control at all.**

## Data model & database

`lib/types.ts` defines `Project`, `Task`, `Person`. The matching Postgres
schema lives in `supabase/migrations/001_initial_schema.sql`, with sample
data in `supabase/seed.sql`. This project reuses the `ip-toolbox-platform`
Supabase project (`vylllnozdmfevzuqhwbc`) with its own separate tables —
credentials are in `.env.local` (gitignored, not committed).

All reads/writes go through `lib/db.ts`, using the Supabase **service role**
key server-side only (`lib/supabase/server.ts`, guarded by `server-only`).
Server actions live in `app/actions.ts`. There's no RLS policy enforcement
because there's no user auth — this is already live in production
without either (see "Deployment" above), which is a real, current risk,
not a someday-concern.

SLA status logic (green/yellow/red) is in `lib/sla.ts` — currently: overdue
if past due date, "at risk" within 2 days of due, on track otherwise. This
threshold is a placeholder until real SLA durations per task are defined.

## SLA reminder cron

`app/api/cron/sla-reminders/route.ts` does the daily check. It's protected
by a `CRON_SECRET` bearer token (in `.env.local`; must also be set in
Vercel's env vars once deployed, and Vercel Cron sends it automatically).
`vercel.json` schedules it for `0 13 * * *` (13:00 UTC) — adjust to
whatever local send time actually makes sense once this deploys; that
schedule only takes effect once the project is deployed to Vercel, it
does nothing in local dev. To test locally:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3001/api/cron/sla-reminders
```

## Note on ports

Port 3000 may already be in use by another local project (e.g.
`business operating system`). Run `npm run dev -- -p 3001` (or any free
port) if so.

## Design

Brand tokens (colors, fonts) in `app/globals.css` are copied from
`ip-toolbox-platform` so this looks like part of the same product family.
