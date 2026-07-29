-- Budget / Job Costing — manual-entry ledger (per the doc: "this section
-- can be a manual entry"). Two parts:
--   1. project_budgets: one row per project holding sold-vs-actual figures
--      for the four fixed categories the doc names (Engineering, Material,
--      Labor + hours, Electrical).
--   2. project_expenses: an itemized running ledger (vendor, amount,
--      description) — this is both "Vendor Invoicing" and "Project
--      Expenses" from the doc, unified into one list since they're the
--      same shape (a cost against the project, attributable to a vendor).
--      Its sum feeds into the actual-cost total.

create table project_budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects(id) on delete cascade,
  engineering_sold_cost numeric(12,2) not null default 0,
  engineering_actual_cost numeric(12,2) not null default 0,
  material_sold_cost numeric(12,2) not null default 0,
  material_actual_cost numeric(12,2) not null default 0,
  labor_sold_cost numeric(12,2) not null default 0,
  labor_actual_cost numeric(12,2) not null default 0,
  labor_sold_hours numeric(8,2) not null default 0,
  labor_actual_hours numeric(8,2) not null default 0,
  electrical_sold_cost numeric(12,2) not null default 0,
  electrical_actual_cost numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);

create trigger project_budgets_set_updated_at
  before update on project_budgets
  for each row
  execute function set_updated_at();

create table project_expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  vendor_name text not null,
  amount numeric(12,2) not null,
  description text,
  invoice_date date,
  logged_by uuid references people(id) on delete set null,
  created_at timestamptz not null default now()
);

create index project_expenses_project_id_idx on project_expenses(project_id);

alter table project_budgets enable row level security;
alter table project_expenses enable row level security;
