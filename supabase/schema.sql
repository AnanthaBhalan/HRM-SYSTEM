-- ============================================================
-- HRMS Supabase Schema
-- ============================================================
-- Creates:
--   - Enum types: app_role, attendance_status, leave_type, leave_status
--   - Core tables: profiles, employees, attendance_records,
--     leave_requests, payroll_records, documents
--   - updated_at triggers
--   - auth.users -> profiles auto-provisioning trigger
--
-- Run this first in the Supabase SQL editor.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- ENUM TYPES
-- ------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('employee', 'admin_hr');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('present', 'absent', 'half_day', 'leave');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.leave_type as enum ('paid', 'sick', 'unpaid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.leave_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- GENERIC updated_at TRIGGER FUNCTION
-- ------------------------------------------------------------
create or replace function public.trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- TABLE: profiles
-- 1:1 with auth.users; profiles.id == auth.users.id.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.app_role not null default 'employee',
  phone text,
  address text,
  profile_picture_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);

drop trigger if exists set_timestamp_profiles on public.profiles;
create trigger set_timestamp_profiles
before update on public.profiles
for each row execute function public.trigger_set_timestamp();

-- ------------------------------------------------------------
-- TABLE: employees
-- Employment-specific data. employees.id shares the same UUID as
-- profiles.id and auth.users.id.
-- ------------------------------------------------------------
create table if not exists public.employees (
  id uuid primary key references public.profiles(id) on delete cascade,
  employee_code text unique not null,
  department text,
  designation text,
  date_of_joining date not null default current_date,
  employment_status text not null default 'active',
  base_salary numeric(12,2) not null default 0,
  manager_id uuid references public.employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_employees_department on public.employees(department);
create index if not exists idx_employees_manager on public.employees(manager_id);

drop trigger if exists set_timestamp_employees on public.employees;
create trigger set_timestamp_employees
before update on public.employees
for each row execute function public.trigger_set_timestamp();

-- ------------------------------------------------------------
-- TABLE: attendance_records
-- One row per employee per day.
-- ------------------------------------------------------------
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  date date not null default current_date,
  check_in timestamptz,
  check_out timestamptz,
  status public.attendance_status not null default 'present',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_attendance_employee_date unique (employee_id, date)
);

create index if not exists idx_attendance_employee on public.attendance_records(employee_id);
create index if not exists idx_attendance_date on public.attendance_records(date);

drop trigger if exists set_timestamp_attendance on public.attendance_records;
create trigger set_timestamp_attendance
before update on public.attendance_records
for each row execute function public.trigger_set_timestamp();

-- ------------------------------------------------------------
-- TABLE: leave_requests
-- ------------------------------------------------------------
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type public.leave_type not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status public.leave_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_leave_dates check (end_date >= start_date)
);

create index if not exists idx_leave_employee on public.leave_requests(employee_id);
create index if not exists idx_leave_status on public.leave_requests(status);

drop trigger if exists set_timestamp_leave on public.leave_requests;
create trigger set_timestamp_leave
before update on public.leave_requests
for each row execute function public.trigger_set_timestamp();

-- ------------------------------------------------------------
-- TABLE: payroll_records
-- Employees read-only; admin_hr can manage.
-- ------------------------------------------------------------
create table if not exists public.payroll_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  pay_period_start date not null,
  pay_period_end date not null,
  basic_salary numeric(12,2) not null default 0,
  allowances numeric(12,2) not null default 0,
  deductions numeric(12,2) not null default 0,
  net_salary numeric(12,2) generated always as (basic_salary + allowances - deductions) stored,
  generated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_payroll_period check (pay_period_end >= pay_period_start)
);

create index if not exists idx_payroll_employee on public.payroll_records(employee_id);
create index if not exists idx_payroll_period on public.payroll_records(pay_period_start, pay_period_end);

drop trigger if exists set_timestamp_payroll on public.payroll_records;
create trigger set_timestamp_payroll
before update on public.payroll_records
for each row execute function public.trigger_set_timestamp();

-- ------------------------------------------------------------
-- TABLE: documents
-- Stores metadata only; actual files live in Supabase Storage.
-- ------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  doc_type text not null default 'other',
  file_name text,
  file_url text not null,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_employee on public.documents(employee_id);
create index if not exists idx_documents_type on public.documents(doc_type);

-- ------------------------------------------------------------
-- AUTO-CREATE PROFILE ON NEW auth.users SIGNUP
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'employee'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
