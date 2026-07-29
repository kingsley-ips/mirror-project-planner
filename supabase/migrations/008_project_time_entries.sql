-- Time tracking — the doc's "Gusto" integration reduced to what's
-- actually needed: log hours per employee per project, categorized
-- Install vs. Electrical, with running totals. Pulling the employee list
-- from Gusto itself needs API credentials we don't have; this uses the
-- existing `people` directory instead — swap the source later if Gusto
-- access shows up. Category lives on the entry (not the person), since
-- someone's job title on a given day doesn't need to be fixed forever.
--
-- Append-only, same reasoning as project_expenses: hours logged here can
-- feed payroll/costing decisions, so it should stay an audit trail.

create type time_entry_category as enum ('Install', 'Electrical');

create table project_time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  work_date date not null,
  hours numeric(6,2) not null check (hours > 0),
  category time_entry_category not null,
  notes text,
  created_at timestamptz not null default now()
);

create index project_time_entries_project_id_idx on project_time_entries(project_id);
create index project_time_entries_person_id_idx on project_time_entries(person_id);

alter table project_time_entries enable row level security;
