-- Adds two Must-Have features from the original one-pager:
--   "Assign tasks to multiple people, create sub-tasks"
--   "Task does not become available until sub task has been completed"
--
-- Sub-tasks: self-referencing parent_task_id. A task with incomplete
-- children is "blocked" — the app prevents marking it in_progress/done
-- until every child task is done.
--
-- Multi-assignee: tasks.assigned_to (single FK) is replaced by a proper
-- join table so a task can have zero, one, or many owners. Existing data
-- is backfilled before the old column is dropped — no dual source of
-- truth for "who owns this task."

alter table tasks
  add column parent_task_id uuid references tasks(id) on delete cascade;

create table task_assignees (
  task_id   uuid not null references tasks(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (task_id, person_id)
);

insert into task_assignees (task_id, person_id)
select id, assigned_to from tasks where assigned_to is not null;

alter table tasks drop column assigned_to;

alter table task_assignees enable row level security;

create index tasks_parent_task_id_idx on tasks(parent_task_id);
create index task_assignees_person_id_idx on task_assignees(person_id);
