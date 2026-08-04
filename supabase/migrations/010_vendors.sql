-- Structured vendor/subcontractor database — company-wide, like `people`.
-- Replaces the free-text `vendor_name` on project_expenses with a real
-- `vendor_id` reference so vendor spend can actually be reported on,
-- and so "Home Depot" typed two different ways doesn't fracture into
-- two vendors.

create table vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  trade text,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger vendors_set_updated_at
  before update on vendors
  for each row
  execute function set_updated_at();

alter table vendors enable row level security;

-- Backfill: one vendor record per distinct existing vendor_name, then
-- point every expense at the matching vendor via vendor_id.
insert into vendors (name)
select distinct vendor_name from project_expenses
on conflict (name) do nothing;

alter table project_expenses add column vendor_id uuid references vendors(id) on delete restrict;

update project_expenses pe
set vendor_id = v.id
from vendors v
where v.name = pe.vendor_name;

alter table project_expenses alter column vendor_id set not null;
alter table project_expenses drop column vendor_name;

create index project_expenses_vendor_id_idx on project_expenses(vendor_id);
