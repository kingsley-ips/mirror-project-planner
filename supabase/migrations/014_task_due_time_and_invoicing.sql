-- Doc must-have: "set due dates and times" — tasks only had a date.
alter table tasks add column due_time text;

-- Doc must-have: "Vendor Invoicing" as its own line item, distinct from
-- the vendor breakout that already existed. The expense ledger itself
-- stays append-only (audit trail); these two fields are the one
-- exception, since invoice number and paid-date are naturally filled in
-- after the fact, not known at the moment the expense is logged.
alter table project_expenses add column invoice_number text;
alter table project_expenses add column invoice_paid_date date;
