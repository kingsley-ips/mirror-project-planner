-- A rule-driven task's due date was being silently overwritten back to
-- its computed value every time the cascade engine ran, even right after
-- someone manually edited it. This flag lets a manual edit stick until
-- the person resets it back to automatic.
alter table tasks add column due_date_overridden boolean not null default false;
