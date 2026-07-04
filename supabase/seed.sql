-- ============================================================
-- HRMS Seed Data
-- ============================================================
-- Run this after schema.sql and policies.sql.
-- Creates 1 admin_hr + 2 employee users with email/password auth,
-- plus sample attendance, leave, and payroll data.
-- ============================================================

-- ------------------------------------------------------------
-- Cleanup previous seed runs (idempotent)
-- ------------------------------------------------------------
delete from public.payroll_records where employee_id in (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
delete from public.leave_requests where employee_id in (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
delete from public.attendance_records where employee_id in (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
delete from public.employees where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
delete from public.profiles where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
delete from auth.identities where user_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
delete from auth.users where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- ------------------------------------------------------------
-- STEP 1: Create auth users
-- ------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, recovery_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values
(
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'admin.hr@hrms.test',
  crypt('Password123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Alex Admin"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'alice.employee@hrms.test',
  crypt('Password123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Alice Employee"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'bob.employee@hrms.test',
  crypt('Password123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Bob Employee"}',
  now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- STEP 2: Create matching identities
-- ------------------------------------------------------------
insert into auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin.hr@hrms.test"}',
  'email', now(), now(), now()
),
(
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '{"sub":"22222222-2222-2222-2222-222222222222","email":"alice.employee@hrms.test"}',
  'email', now(), now(), now()
),
(
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  '{"sub":"33333333-3333-3333-3333-333333333333","email":"bob.employee@hrms.test"}',
  'email', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;

-- ------------------------------------------------------------
-- STEP 3: profiles
-- ------------------------------------------------------------
insert into public.profiles (id, email, full_name, role, phone, address)
values
(
  '11111111-1111-1111-1111-111111111111',
  'admin.hr@hrms.test',
  'Alex Admin',
  'admin_hr',
  '+91-9000000001',
  'HR Office, HQ'
),
(
  '22222222-2222-2222-2222-222222222222',
  'alice.employee@hrms.test',
  'Alice Employee',
  'employee',
  '+91-9000000002',
  '12 MG Road, Bengaluru'
),
(
  '33333333-3333-3333-3333-333333333333',
  'bob.employee@hrms.test',
  'Bob Employee',
  'employee',
  '+91-9000000003',
  '45 Park Street, Kolkata'
)
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role,
  phone = excluded.phone,
  address = excluded.address;

-- ------------------------------------------------------------
-- STEP 4: employees
-- ------------------------------------------------------------
insert into public.employees (
  id, employee_code, department, designation, date_of_joining,
  employment_status, base_salary, manager_id
) values
(
  '11111111-1111-1111-1111-111111111111',
  'EMP-0001', 'Human Resources', 'HR Manager', '2022-01-10',
  'active', 90000, null
),
(
  '22222222-2222-2222-2222-222222222222',
  'EMP-0002', 'Engineering', 'Software Engineer', '2023-03-15',
  'active', 70000, '11111111-1111-1111-1111-111111111111'
),
(
  '33333333-3333-3333-3333-333333333333',
  'EMP-0003', 'Engineering', 'QA Engineer', '2023-06-01',
  'active', 60000, '11111111-1111-1111-1111-111111111111'
)
on conflict (id) do update set
  employee_code = excluded.employee_code,
  department = excluded.department,
  designation = excluded.designation,
  date_of_joining = excluded.date_of_joining,
  employment_status = excluded.employment_status,
  base_salary = excluded.base_salary,
  manager_id = excluded.manager_id;

-- ------------------------------------------------------------
-- STEP 5: attendance rows
-- ------------------------------------------------------------
insert into public.attendance_records (
  employee_id, date, check_in, check_out, status, notes
) values
(
  '22222222-2222-2222-2222-222222222222', current_date - 2,
  (current_date - 2) + time '09:02', (current_date - 2) + time '18:05',
  'present', 'Regular day'
),
(
  '22222222-2222-2222-2222-222222222222', current_date - 1,
  (current_date - 1) + time '09:10', (current_date - 1) + time '17:50',
  'present', 'On time'
),
(
  '22222222-2222-2222-2222-222222222222', current_date,
  current_date + time '09:00', null,
  'present', 'Check-in today'
),
(
  '33333333-3333-3333-3333-333333333333', current_date - 2,
  (current_date - 2) + time '09:30', (current_date - 2) + time '13:30',
  'half_day', 'Half day'
),
(
  '33333333-3333-3333-3333-333333333333', current_date - 1,
  null, null,
  'absent', 'No attendance'
),
(
  '33333333-3333-3333-3333-333333333333', current_date,
  current_date + time '09:05', null,
  'present', 'Present today'
)
on conflict (employee_id, date) do nothing;

-- ------------------------------------------------------------
-- STEP 6: leave requests
-- ------------------------------------------------------------
insert into public.leave_requests (
  employee_id, leave_type, start_date, end_date, reason, status,
  reviewed_by, reviewed_at
) values
(
  '22222222-2222-2222-2222-222222222222', 'sick',
  current_date + 3, current_date + 4, 'Fever and cold', 'pending',
  null, null
),
(
  '33333333-3333-3333-3333-333333333333', 'paid',
  current_date - 10, current_date - 9, 'Family function', 'approved',
  '11111111-1111-1111-1111-111111111111', now() - interval '5 days'
),
(
  '33333333-3333-3333-3333-333333333333', 'unpaid',
  current_date + 20, current_date + 21, 'Personal trip', 'rejected',
  '11111111-1111-1111-1111-111111111111', now() - interval '1 day'
);

-- ------------------------------------------------------------
-- STEP 7: payroll rows
-- ------------------------------------------------------------
insert into public.payroll_records (
  employee_id, pay_period_start, pay_period_end,
  basic_salary, allowances, deductions, generated_by
) values
(
  '22222222-2222-2222-2222-222222222222',
  date_trunc('month', current_date - interval '1 month')::date,
  (date_trunc('month', current_date) - interval '1 day')::date,
  70000, 5000, 2000,
  '11111111-1111-1111-1111-111111111111'
),
(
  '33333333-3333-3333-3333-333333333333',
  date_trunc('month', current_date - interval '1 month')::date,
  (date_trunc('month', current_date) - interval '1 day')::date,
  60000, 3000, 1500,
  '11111111-1111-1111-1111-111111111111'
);

-- ------------------------------------------------------------
-- Done.
-- ------------------------------------------------------------
