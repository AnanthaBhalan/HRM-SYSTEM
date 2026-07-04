-- ============================================================
-- HRMS Seed Data
-- ============================================================
-- Run this after schema.sql and policies.sql.
-- Creates 1 admin_hr + 5 employee users with email/password auth,
-- plus sample attendance, leave, and payroll data.
-- ============================================================

-- ------------------------------------------------------------
-- Cleanup previous seed runs (idempotent)
-- ------------------------------------------------------------
delete from public.payroll_records where employee_id in (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
delete from public.leave_requests where employee_id in (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
delete from public.attendance_records where employee_id in (
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
delete from public.employees where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
delete from public.profiles where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
delete from auth.identities where user_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
delete from auth.users where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
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
),
(
  '00000000-0000-0000-0000-000000000000',
  '44444444-4444-4444-4444-444444444444',
  'authenticated', 'authenticated',
  'carol.employee@hrms.test',
  crypt('Password123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Carol Employee"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '55555555-5555-5555-5555-555555555555',
  'authenticated', 'authenticated',
  'david.employee@hrms.test',
  crypt('Password123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"David Employee"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  '66666666-6666-6666-6666-666666666666',
  'authenticated', 'authenticated',
  'emma.employee@hrms.test',
  crypt('Password123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Emma Employee"}',
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
),
(
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  '{"sub":"44444444-4444-4444-4444-444444444444","email":"carol.employee@hrms.test"}',
  'email', now(), now(), now()
),
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  '55555555-5555-5555-5555-555555555555',
  '{"sub":"55555555-5555-5555-5555-555555555555","email":"david.employee@hrms.test"}',
  'email', now(), now(), now()
),
(
  gen_random_uuid(),
  '66666666-6666-6666-6666-666666666666',
  '66666666-6666-6666-6666-666666666666',
  '{"sub":"66666666-6666-6666-6666-666666666666","email":"emma.employee@hrms.test"}',
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
),
(
  '44444444-4444-4444-4444-444444444444',
  'carol.employee@hrms.test',
  'Carol Employee',
  'employee',
  '+91-9000000004',
  '78 Marine Drive, Mumbai'
),
(
  '55555555-5555-5555-5555-555555555555',
  'david.employee@hrms.test',
  'David Employee',
  'employee',
  '+91-9000000005',
  '23 Connaught Place, Delhi'
),
(
  '66666666-6666-6666-6666-666666666666',
  'emma.employee@hrms.test',
  'Emma Employee',
  'employee',
  '+91-9000000006',
  '56 Brigade Road, Bengaluru'
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
),
(
  '44444444-4444-4444-4444-444444444444',
  'EMP-0004', 'Marketing', 'Marketing Specialist', '2023-08-15',
  'active', 55000, '11111111-1111-1111-1111-111111111111'
),
(
  '55555555-5555-5555-5555-555555555555',
  'EMP-0005', 'Sales', 'Sales Executive', '2023-09-01',
  'active', 50000, '11111111-1111-1111-1111-111111111111'
),
(
  '66666666-6666-6666-6666-666666666666',
  'EMP-0006', 'Engineering', 'DevOps Engineer', '2023-10-10',
  'active', 75000, '11111111-1111-1111-1111-111111111111'
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
),
(
  '44444444-4444-4444-4444-444444444444', current_date - 4,
  (current_date - 4) + time '09:15', (current_date - 4) + time '18:30',
  'present', 'Regular day'
),
(
  '44444444-4444-4444-4444-444444444444', current_date - 3,
  (current_date - 3) + time '09:00', (current_date - 3) + time '17:45',
  'present', 'On time'
),
(
  '44444444-4444-4444-4444-444444444444', current_date - 2,
  null, null,
  'absent', 'Sick leave'
),
(
  '44444444-4444-4444-4444-444444444444', current_date - 1,
  (current_date - 1) + time '09:30', (current_date - 1) + time '14:00',
  'half_day', 'Personal work'
),
(
  '44444444-4444-4444-4444-444444444444', current_date,
  current_date + time '09:10', null,
  'present', 'Present today'
),
(
  '55555555-5555-5555-5555-555555555555', current_date - 3,
  (current_date - 3) + time '08:45', (current_date - 3) + time '18:00',
  'present', 'Early bird'
),
(
  '55555555-5555-5555-5555-555555555555', current_date - 2,
  (current_date - 2) + time '09:20', (current_date - 2) + time '19:00',
  'present', 'Late finish'
),
(
  '55555555-5555-5555-5555-555555555555', current_date - 1,
  (current_date - 1) + time '09:00', (current_date - 1) + time '17:30',
  'present', 'Regular day'
),
(
  '55555555-5555-5555-5555-555555555555', current_date,
  current_date + time '09:05', null,
  'present', 'Present today'
),
(
  '66666666-6666-6666-6666-666666666666', current_date - 5,
  (current_date - 5) + time '09:00', (current_date - 5) + time '17:00',
  'present', 'Regular day'
),
(
  '66666666-6666-6666-6666-666666666666', current_date - 4,
  (current_date - 4) + time '09:10', (current_date - 4) + time '17:50',
  'present', 'Regular day'
),
(
  '66666666-6666-6666-6666-666666666666', current_date - 3,
  null, null,
  'leave', 'Approved leave'
),
(
  '66666666-6666-6666-6666-666666666666', current_date - 2,
  (current_date - 2) + time '09:00', (current_date - 2) + time '18:00',
  'present', 'Back from leave'
),
(
  '66666666-6666-6666-6666-666666666666', current_date - 1,
  (current_date - 1) + time '08:55', (current_date - 1) + time '17:30',
  'present', 'Regular day'
),
(
  '66666666-6666-6666-6666-666666666666', current_date,
  current_date + time '09:00', null,
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
),
(
  '44444444-4444-4444-4444-444444444444', 'paid',
  current_date + 5, current_date + 7, 'Family vacation', 'pending',
  null, null
),
(
  '44444444-4444-4444-4444-444444444444', 'sick',
  current_date - 15, current_date - 14, 'Medical appointment', 'approved',
  '11111111-1111-1111-1111-111111111111', now() - interval '10 days'
),
(
  '55555555-5555-5555-5555-555555555555', 'paid',
  current_date + 10, current_date + 12, 'Wedding attendance', 'pending',
  null, null
),
(
  '55555555-5555-5555-5555-555555555555', 'unpaid',
  current_date - 20, current_date - 19, 'Personal emergency', 'approved',
  '11111111-1111-1111-1111-111111111111', now() - interval '15 days'
),
(
  '66666666-6666-6666-6666-666666666666', 'sick',
  current_date + 15, current_date + 16, 'Dental checkup', 'pending',
  null, null
),
(
  '66666666-6666-6666-6666-666666666666', 'paid',
  current_date - 8, current_date - 6, 'Family function', 'approved',
  '11111111-1111-1111-1111-111111111111', now() - interval '5 days'
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
),
(
  '44444444-4444-4444-4444-444444444444',
  date_trunc('month', current_date - interval '1 month')::date,
  (date_trunc('month', current_date) - interval '1 day')::date,
  55000, 2500, 1200,
  '11111111-1111-1111-1111-111111111111'
),
(
  '55555555-5555-5555-5555-555555555555',
  date_trunc('month', current_date - interval '1 month')::date,
  (date_trunc('month', current_date) - interval '1 day')::date,
  50000, 2000, 1000,
  '11111111-1111-1111-1111-111111111111'
),
(
  '66666666-6666-6666-6666-666666666666',
  date_trunc('month', current_date - interval '1 month')::date,
  (date_trunc('month', current_date) - interval '1 day')::date,
  75000, 4000, 2000,
  '11111111-1111-1111-1111-111111111111'
);

-- ------------------------------------------------------------
-- Done.
-- ------------------------------------------------------------
