-- Support for cascading SLA dates. "Electrical Review: 5 days once
-- assigned" needs to know WHEN a task first got an assignee — set once,
-- never overwritten by later reassignment.

alter table tasks add column first_assigned_at timestamptz;
