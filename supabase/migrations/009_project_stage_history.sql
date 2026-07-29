-- Lifecycle day-count metrics ("days in engineering," "closed-won to
-- PTO," etc. from the doc) need to know WHEN a project entered each
-- stage, not just its current stage. This table is that history —
-- one row per stage transition. Existing projects get a single
-- backfilled row (their current stage, dated to project creation) since
-- we have no real history for them; duration math from that point on
-- will be accurate going forward.

create table project_stage_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage project_stage not null,
  entered_at timestamptz not null default now()
);

create index project_stage_history_project_id_idx on project_stage_history(project_id);

insert into project_stage_history (project_id, stage, entered_at)
select id, stage, created_at from projects;

alter table project_stage_history enable row level security;
