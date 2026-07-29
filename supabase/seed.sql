-- Sample data for local development / demo only.

insert into people (name, email, team) values
  ('Kenny Courtney', 'kenny@solarips.com', 'Commercial'),
  ('Whitney', 'whitney@solarips.com', 'OPS'),
  ('Jordan Rivera', 'jordan@solarips.com', 'Design'),
  ('Sam Patel', 'sam@solarips.com', 'Field');

insert into projects (name, customer_name, stage, sold_install_date, projected_install_date, google_drive_folder_url)
values
  ('Riverside Distribution Center', 'Riverside Logistics Inc.', 'Construction', '2026-08-15', '2026-08-20', 'https://drive.google.com/drive/folders/example1'),
  ('Maple Street Office Park', 'Maple Street Holdings', 'Design', '2026-09-30', '2026-10-05', 'https://drive.google.com/drive/folders/example2'),
  ('Northgate Cold Storage', 'Northgate Foods', 'Permitting/Utility', '2026-09-01', '2026-09-10', 'https://drive.google.com/drive/folders/example3');

-- Tasks for Riverside Distribution Center (overdue example)
insert into tasks (project_id, title, category, assigned_to, due_date, sla_days, status)
select id, 'Site Audit Complete', 'Pre Design',
  (select id from people where name = 'Sam Patel'),
  current_date - interval '3 days', 5, 'not_started'
from projects where name = 'Riverside Distribution Center';

insert into tasks (project_id, title, category, assigned_to, due_date, sla_days, status)
select id, 'Crane Scheduled', 'Job Logistics',
  (select id from people where name = 'Whitney'),
  current_date + interval '1 day', 3, 'in_progress'
from projects where name = 'Riverside Distribution Center';

-- Tasks for Maple Street Office Park (on-track example)
insert into tasks (project_id, title, category, assigned_to, due_date, sla_days, status)
select id, '50% Plan Set Review', 'Design',
  (select id from people where name = 'Jordan Rivera'),
  current_date + interval '10 days', 14, 'in_progress'
from projects where name = 'Maple Street Office Park';

insert into tasks (project_id, title, category, assigned_to, due_date, sla_days, status)
select id, 'Structural Letter', 'Design',
  (select id from people where name = 'Jordan Rivera'),
  current_date + interval '2 days', 7, 'not_started'
from projects where name = 'Maple Street Office Park';

-- Tasks for Northgate Cold Storage (done example)
insert into tasks (project_id, title, category, assigned_to, due_date, sla_days, status, completed_at)
select id, 'Permit Submitted', 'Design',
  (select id from people where name = 'Kenny Courtney'),
  current_date - interval '5 days', 10, 'done', now() - interval '6 days'
from projects where name = 'Northgate Cold Storage';
