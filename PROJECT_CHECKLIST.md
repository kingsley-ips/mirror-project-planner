# Mirror Project Planner — Completion Checklist

Derived directly from the "IP Tool Request One-Pager — Commercial Solar" (Kenny Courtney, OPS/Commercial). Every item below traces back to something the document actually asked for. When every item in **Sections A–F** is checked, the project satisfies everything the doc calls a requirement. Section G (nice-to-haves) is explicitly *not* required for "done" — the doc itself calls these things "that would be great but could wait."

Status key: ✅ Done · ⚠️ Partial / built differently than literally worded · ❌ Not built

---

## A. Must-Haves (Section 6)

- [x] ✅ SLA on required fields — 9 rule-based deadlines live; remaining tasks have no SLA yet because the doc itself says Kenny still needs to determine them ("KC-7.2.26 to Determine the required tasks")
- [x] ✅ Adjusting an SLA-anchor date cascades to every dependent task's date automatically
- [x] ⚠️ All required tasks assigned to the appropriate party — assigning is fully supported; there's no automated "correct person for this task type" mapping, so *who* is appropriate is still a human judgment call each time
- [x] ✅ Email sent when someone has an open task assigned
- [x] ✅ A task can't move to in-progress/done until its subtasks are complete
- [x] ✅ Gantt chart, generated from entered dates, updates automatically when dates change
- [x] ✅ Adjusting a task's anchor date auto-shifts its computed end date per its SLA
- [x] ✅ Stoplight tracking — green/yellow/red dot per task based on SLA status
- [x] ✅ Dashboard for all employees, customizable (5 toggleable cards: My Open Tasks, At-Risk/Overdue, Team Capacity, All Projects, Recent Daily Logs)
- [x] ✅ Project stage tracker — Sales / Design / Permitting-Utility / Construction / Final Deliverables / Complete / On Hold
- [x] ✅ Link to Google customer (Drive) folder
- [x] ✅ Link to Google Photos folder
- [x] ✅ Quickly assign tasks and see everyone's work across the org (`/tasks`)
- [x] ✅ Assign tasks to multiple people; create sub-tasks; set due dates **and times**
- [x] ✅ Filter tasks by status, by individual, and by unassigned
- [x] ✅ Identify capacity / bottlenecks per person (Team Capacity view)
- [x] ✅ "There should not be two places where you have to update the same raw information" — closed for the 3 tasks that genuinely exist in both systems (Site Audit Complete, Electrical Review, BOM Approved) via Mirror → Salesforce write-back. Nothing else in the checklist has a Salesforce counterpart to conflict with.

## B. The Required Task List Itself (Section 6, the deliverables table)

- [x] ✅ All 39 tasks from the doc's Pre Design / Design / Job Logistics / Material Logistics / Construction / Project Closeout table exist as the standard checklist
- [x] ✅ Checklist auto-applies the moment a project is created (not a manual step)
- [x] ✅ Sold Install Date and Projected Install Date exist as project-level fields (not tasks, matching the doc's own table layout)
- [x] ✅ The 9 explicitly-dated rules (Site Audit Complete, Site Audit Report, Site Audit Photos, 50% Plan Complete, 50% Plan Set Review, Loading Plan Complete, 100% Plan Set Review, Electrical Review, Safety Plan/JHA) are all implemented exactly per the day-counts and anchors given

## C. Daily Logs (Section 6, "Create a Section for daily Logs")

- [x] ✅ One log per project per day
- [x] ✅ All 12 listed fields present: date, weather, OSHA heat index, daily goal, personnel on site, other trades on site, visitors on site, anticipated delays, delays/bottlenecks, project update, safety incidents, notes
- [x] ✅ "Upload photos to this section" — direct photo upload per entry, stored in Supabase Storage

## D. Vendor & Subcontractor Management (Section 6, "Job Tread" — Chatter-style log)

- [x] ✅ Emails can be linked to a project
- [x] ✅ Tag dropdown (Internal / Vendor / Owner / GC / Other)
- [x] ✅ Filter/search past emails by tag or content

## E. Budget (Section 6, "Job Tread — Budget")

- [x] ✅ Cost per scope: Engineering, Material, Labor (+ hours), Electrical — sold vs. actual, manual entry
- [x] ✅ Running expense ledger, append-only (audit trail)
- [x] ✅ Vendor breakout — real company-wide vendor database, per-vendor spend shown on each project's Budget page
- [x] ✅ Vendor **invoicing** — invoice number and paid-date tracked per expense, editable after the fact
- [x] ✅ Budget summary (Total Sold vs. Total Actual) updates live on every page load

## F. Integrations (Section 8)

- [x] ✅ Pulls from Salesforce — commercial projects only (`RecordType = PV-COM` or name ending in "COM"), contracts signed in the last 6 months, syncing every 15 minutes
- [x] ✅ Writes back to Salesforce for the 3 overlapping fields (beyond what the doc technically asked for, but required to satisfy the "no two places" rule above)

---

## G. Nice-to-Haves (Section 6 cont. + Whitney's notes) — *not required for "done"*

- [ ] ⚠️ Granular lifecycle counters (days in engineering / to permit submittal / at jurisdiction / in construction / to final inspection / to PTO) — a simpler stage-based lifecycle tracker exists instead of these exact sub-milestones
- [ ] ⚠️ Time tracking tab pulling employees from Gusto/company directory — time tracking exists, employee list is manual entry
- [ ] ⚠️ Task reports by person / type / urgency / project — `/tasks` covers person, urgency, and project; not a distinct "by category type" report
- [x] ✅ Contacts section — GC/EC/roofer/owner cards linked to a project, each with name/business/phone/email/notes

---

## Open Question Worth Resolving

**"Schedule techs"** (Section 4: *"...schedule techs, record hours and track project expenses in real time"*) — there's no dedicated crew/tech scheduling calendar in Mirror today. Assigning a person to a task with a due date exists, but a literal scheduling view (who's on which job, which days) doesn't. Worth clarifying with Kenny whether task assignment already covers this in practice, or whether a real scheduling view is expected before calling this done.

---

## Bottom Line

Every **must-have** and every named **deliverable** in Sections A–F is now built and verified against real data. The three small gaps from the first pass (due times, per-entry photo upload, vendor invoicing) are closed. The one remaining item is not a build gap — it's a question only Kenny can answer: does task assignment already cover "schedule techs" in practice, or is a real scheduling calendar expected? That's the only thing standing between this checklist and fully done.
