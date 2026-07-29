-- Tracks the last SLA status we emailed someone about, so the daily
-- reminder job only fires once per escalation (not every day the task
-- stays overdue) and resets once the task is back on track.

alter table tasks
  add column last_notified_status text
    check (last_notified_status in ('atrisk', 'overdue')),
  add column last_notified_at timestamptz;
