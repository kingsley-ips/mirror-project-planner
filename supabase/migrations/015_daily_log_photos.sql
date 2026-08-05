-- Doc must-have: "Upload Photos to this section" (daily logs). Public
-- bucket — same trust level as the Google Photos folder link this
-- replaces; uploads only ever happen server-side via the service role
-- key, so RLS on storage.objects isn't the gate here, public read is.
insert into storage.buckets (id, name, public)
values ('daily-log-photos', 'daily-log-photos', true)
on conflict (id) do nothing;

create table daily_log_photos (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references daily_logs(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);
