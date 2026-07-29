-- "Vendor and Subcontractor Management" from the original one-pager — in
-- practice this is a Chatter-style communications log: paste an email
-- onto a project, tag who it's with, search it later. Not a structured
-- vendor database (that's the separate, still-unbuilt Contacts section).

create type email_tag as enum ('Internal', 'Vendor', 'Owner', 'GC', 'Other');

create table project_emails (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  tag email_tag not null default 'Other',
  subject text,
  content text not null,
  email_link text,
  logged_by uuid references people(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_emails_project_id_idx on project_emails(project_id);

create trigger project_emails_set_updated_at
  before update on project_emails
  for each row
  execute function set_updated_at();

alter table project_emails enable row level security;
