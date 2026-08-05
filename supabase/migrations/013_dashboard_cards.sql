-- Per-person dashboard customization ("Dashboard view for all employees.
-- Must be customizable" — must-have). Null means "hasn't customized yet,
-- show every card" rather than defaulting to an empty dashboard.
alter table people add column dashboard_cards text[];
