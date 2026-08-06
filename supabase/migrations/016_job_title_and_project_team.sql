-- Doc: "Create Dropdown for each employee, list to include job title,
-- job titles = Installer, Electrician." Free text rather than a fixed
-- enum since plenty of people (OPS, Sales, Design) don't fit either.
alter table people add column job_title text;

-- Doc: "OPS can assign employees to the project -> Once an employee is
-- assigned to a project, hours can be entered." Time entries now require
-- the person to already be on this list.
create table project_team_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, person_id)
);
