-- Mirror Project Planner — Phase 1 schema
-- Scope: project stage tracking, task list with owners/due dates, SLA stoplight.
-- Gantt/cascading-date logic, budgets, and daily logs are later phases — not modeled yet.

create extension if not exists "pgcrypto";

create type project_stage as enum (
  'Sales',
  'Design',
  'Permitting/Utility',
  'Construction',
  'Final Deliverables',
  'Complete',
  'On Hold'
);

create type task_category as enum (
  'Pre Design',
  'Design',
  'Job Logistics',
  'Material Logistics',
  'Construction',
  'Project Closeout'
);

create type task_status as enum ('not_started', 'in_progress', 'done');

create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  team text not null check (team in ('Commercial', 'OPS', 'Design', 'Sales', 'Field')),
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  customer_name text not null,
  stage project_stage not null default 'Sales',
  sold_install_date date,
  projected_install_date date,
  google_drive_folder_url text,
  google_photos_folder_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  category task_category not null,
  assigned_to uuid references people(id) on delete set null,
  due_date date,
  sla_days integer,
  status task_status not null default 'not_started',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_project_id_idx on tasks(project_id);
create index tasks_assigned_to_idx on tasks(assigned_to);

-- updated_at bookkeeping
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_set_updated_at
  before update on projects
  for each row
  execute function set_updated_at();

-- RLS: locked down by default, opened up once auth/roles are wired in.
alter table people enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
