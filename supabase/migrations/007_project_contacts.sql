-- Contacts section (Whitney's note): link any number of contacts to a
-- project — GC, EC, roofer, owner, whatever — as free-form cards rather
-- than a fixed dropdown, since projects don't all have the same roster
-- of outside parties.

create table project_contacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  role_description text,
  business text,
  phone text,
  other_phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_contacts_project_id_idx on project_contacts(project_id);

create trigger project_contacts_set_updated_at
  before update on project_contacts
  for each row
  execute function set_updated_at();

alter table project_contacts enable row level security;
