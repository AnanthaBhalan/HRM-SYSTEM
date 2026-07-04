-- ============================================================
-- HRMS Row Level Security (RLS) Policies
-- ============================================================
-- Run this after schema.sql.
-- ============================================================

-- ------------------------------------------------------------
-- Helper: is_admin_hr()
-- ------------------------------------------------------------
create or replace function public.is_admin_hr()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin_hr'
  );
$$;

grant execute on function public.is_admin_hr() to authenticated;

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin_hr());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin_hr())
with check (id = auth.uid() or public.is_admin_hr());

create or replace function public.enforce_profile_update_columns()
returns trigger as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if public.is_admin_hr() then
    return new;
  end if;

  if new.role is distinct from old.role
     or new.email is distinct from old.email
     or new.full_name is distinct from old.full_name then
    raise exception 'Only admin_hr can change role, email or full_name';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_enforce_profile_update_columns on public.profiles;
create trigger trg_enforce_profile_update_columns
before update on public.profiles
for each row execute function public.enforce_profile_update_columns();

-- ------------------------------------------------------------
-- EMPLOYEES
-- ------------------------------------------------------------
alter table public.employees enable row level security;
alter table public.employees force row level security;

drop policy if exists "employees_select_own_or_admin" on public.employees;
create policy "employees_select_own_or_admin"
on public.employees for select
to authenticated
using (id = auth.uid() or public.is_admin_hr());

drop policy if exists "employees_insert_admin" on public.employees;
create policy "employees_insert_admin"
on public.employees for insert
to authenticated
with check (public.is_admin_hr());

drop policy if exists "employees_update_admin" on public.employees;
create policy "employees_update_admin"
on public.employees for update
to authenticated
using (public.is_admin_hr())
with check (public.is_admin_hr());

drop policy if exists "employees_delete_admin" on public.employees;
create policy "employees_delete_admin"
on public.employees for delete
to authenticated
using (public.is_admin_hr());

-- ------------------------------------------------------------
-- ATTENDANCE_RECORDS
-- ------------------------------------------------------------
alter table public.attendance_records enable row level security;
alter table public.attendance_records force row level security;

drop policy if exists "attendance_select_own_or_admin" on public.attendance_records;
create policy "attendance_select_own_or_admin"
on public.attendance_records for select
to authenticated
using (employee_id = auth.uid() or public.is_admin_hr());

drop policy if exists "attendance_insert_own_or_admin" on public.attendance_records;
create policy "attendance_insert_own_or_admin"
on public.attendance_records for insert
to authenticated
with check (employee_id = auth.uid() or public.is_admin_hr());

drop policy if exists "attendance_update_own_or_admin" on public.attendance_records;
create policy "attendance_update_own_or_admin"
on public.attendance_records for update
to authenticated
using (employee_id = auth.uid() or public.is_admin_hr())
with check (employee_id = auth.uid() or public.is_admin_hr());

drop policy if exists "attendance_delete_admin" on public.attendance_records;
create policy "attendance_delete_admin"
on public.attendance_records for delete
to authenticated
using (public.is_admin_hr());

-- ------------------------------------------------------------
-- LEAVE_REQUESTS
-- ------------------------------------------------------------
alter table public.leave_requests enable row level security;
alter table public.leave_requests force row level security;

drop policy if exists "leave_select_own_or_admin" on public.leave_requests;
create policy "leave_select_own_or_admin"
on public.leave_requests for select
to authenticated
using (employee_id = auth.uid() or public.is_admin_hr());

drop policy if exists "leave_insert_own_or_admin" on public.leave_requests;
create policy "leave_insert_own_or_admin"
on public.leave_requests for insert
to authenticated
with check (employee_id = auth.uid() or public.is_admin_hr());

drop policy if exists "leave_update_own_pending_or_admin" on public.leave_requests;
create policy "leave_update_own_pending_or_admin"
on public.leave_requests for update
to authenticated
using ((employee_id = auth.uid() and status = 'pending') or public.is_admin_hr())
with check ((employee_id = auth.uid() and status = 'pending') or public.is_admin_hr());

drop policy if exists "leave_delete_admin" on public.leave_requests;
create policy "leave_delete_admin"
on public.leave_requests for delete
to authenticated
using (public.is_admin_hr());

create or replace function public.enforce_leave_review_fields()
returns trigger as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if public.is_admin_hr() then
    if new.status is distinct from old.status then
      new.reviewed_by = auth.uid();
      new.reviewed_at = now();
    end if;
    return new;
  end if;

  if new.status is distinct from old.status
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at then
    raise exception 'Only admin_hr can approve or reject leave requests';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_enforce_leave_review_fields on public.leave_requests;
create trigger trg_enforce_leave_review_fields
before update on public.leave_requests
for each row execute function public.enforce_leave_review_fields();

-- ------------------------------------------------------------
-- PAYROLL_RECORDS
-- ------------------------------------------------------------
alter table public.payroll_records enable row level security;
alter table public.payroll_records force row level security;

drop policy if exists "payroll_select_own_or_admin" on public.payroll_records;
create policy "payroll_select_own_or_admin"
on public.payroll_records for select
to authenticated
using (employee_id = auth.uid() or public.is_admin_hr());

drop policy if exists "payroll_insert_admin" on public.payroll_records;
create policy "payroll_insert_admin"
on public.payroll_records for insert
to authenticated
with check (public.is_admin_hr());

drop policy if exists "payroll_update_admin" on public.payroll_records;
create policy "payroll_update_admin"
on public.payroll_records for update
to authenticated
using (public.is_admin_hr())
with check (public.is_admin_hr());

drop policy if exists "payroll_delete_admin" on public.payroll_records;
create policy "payroll_delete_admin"
on public.payroll_records for delete
to authenticated
using (public.is_admin_hr());

-- ------------------------------------------------------------
-- DOCUMENTS
-- ------------------------------------------------------------
alter table public.documents enable row level security;
alter table public.documents force row level security;

drop policy if exists "documents_select_own_or_admin" on public.documents;
create policy "documents_select_own_or_admin"
on public.documents for select
to authenticated
using (employee_id = auth.uid() or public.is_admin_hr());

drop policy if exists "documents_insert_own_or_admin" on public.documents;
create policy "documents_insert_own_or_admin"
on public.documents for insert
to authenticated
with check (employee_id = auth.uid() or public.is_admin_hr());

drop policy if exists "documents_update_own_or_admin" on public.documents;
create policy "documents_update_own_or_admin"
on public.documents for update
to authenticated
using (employee_id = auth.uid() or public.is_admin_hr())
with check (employee_id = auth.uid() or public.is_admin_hr());

drop policy if exists "documents_delete_own_or_admin" on public.documents;
create policy "documents_delete_own_or_admin"
on public.documents for delete
to authenticated
using (employee_id = auth.uid() or public.is_admin_hr());
