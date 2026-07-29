-- Daily Logs — one entry per project per day, filled out by whoever's
-- leading the crew that day. Photos aren't stored here; the entry just
-- points back at the project's existing Google Photos folder link rather
-- than standing up a separate file-upload pipeline.

create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  log_date date not null,
  weather text,
  heat_index text,
  daily_goal text,
  personnel_on_site text,
  other_trades_on_site text,
  visitors_on_site text,
  anticipated_delays text,
  delays_or_bottlenecks text,
  project_update text,
  safety_incidents text,
  notes text,
  created_by uuid references people(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, log_date)
);

create index daily_logs_project_id_idx on daily_logs(project_id);

create trigger daily_logs_set_updated_at
  before update on daily_logs
  for each row
  execute function set_updated_at();

alter table daily_logs enable row level security;
