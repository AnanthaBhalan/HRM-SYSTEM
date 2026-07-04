# HRMS Backend Handoff Note

This folder contains a simple Supabase backend for a hackathon-friendly HRMS MVP.

## Run order
1. Run schema.sql
2. Run policies.sql
3. Run seed.sql

## Frontend integration contract

### Tables
- profiles: user identity, role, contact fields
- employees: employment details and manager link
- attendance_records: one row per employee per day
- leave_requests: leave requests and approval workflow
- payroll_records: salary/payroll rows
- documents: document metadata only

### Important columns
- profiles.id, profiles.role, profiles.email, profiles.full_name
- employees.id, employees.employee_code, employees.department, employees.designation, employees.base_salary
- attendance_records.employee_id, attendance_records.date, attendance_records.status
- leave_requests.employee_id, leave_requests.status, leave_requests.leave_type, leave_requests.start_date, leave_requests.end_date
- payroll_records.employee_id, payroll_records.pay_period_start, payroll_records.pay_period_end, payroll_records.net_salary

### Frontend pages to query
- Login/signup: use Supabase Auth only
- Employee dashboard: read own profile + own attendance + own leave + own payroll
- Employee profile: read/update own profile fields (phone, address, picture)
- Admin dashboard: read counts/overview from employees, attendance, leave, payroll
- Admin employees: read employee directory and update employee records
- Admin attendance: read attendance for all employees
- Admin leave approvals: read all leave requests and approve/reject them
- Admin payroll: read and manage payroll rows

### Frontend must never update directly
- profiles.role
- profiles.email
- profiles.full_name
- leave_requests.status (except through an admin-approved workflow)
- payroll_records (employee role should never write these)
- any row that would bypass RLS or change permissions

## Notes
- Employee access is scoped to their own rows.
- admin_hr can view and manage all HRMS data.
- Keep the frontend simple: read via Supabase client, and let RLS enforce access rules.
