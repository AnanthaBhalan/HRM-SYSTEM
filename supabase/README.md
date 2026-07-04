# HRMS Backend Setup

This folder contains a clean, free-tier-friendly Supabase backend foundation for a small HRMS MVP.

## A. Architecture

- Supabase Auth is the identity layer.
- The app uses the `auth.users` table as the base identity model.
- A matching row in `public.profiles` is created automatically for each new sign-up.
- `public.employees` stores employment-specific information.
- `attendance_records`, `leave_requests`, `payroll_records`, and `documents` hold the operational data.
- Row Level Security (RLS) protects every sensitive table so the frontend can call Supabase directly without a custom backend layer.

## B. Schema design

### profiles
Stores identity and role information.

- `id`: same UUID as `auth.users.id`
- `email`, `full_name`
- `role`: `employee` or `admin_hr`
- `phone`, `address`, `profile_picture_url`

### employees
Employment-specific details.

- `id`: same UUID as `profiles.id`
- `employee_code`
- `department`, `designation`, `employment_status`
- `base_salary`, `manager_id`

### attendance_records
One row per employee per day.

- `status`: `present`, `absent`, `half_day`, `leave`

### leave_requests
Leave workflow data.

- `leave_type`: `paid`, `sick`, `unpaid`
- `status`: `pending`, `approved`, `rejected`
- `reviewed_by`, `reviewed_at`

### payroll_records
Payroll data.

- Employees can read their own payroll.
- `admin_hr` can create/update/delete payroll rows.

### documents
Metadata for employee documents and profile pictures.

## C. How to use

Run the SQL files in this order:

1. `schema.sql`
2. `policies.sql`
3. `seed.sql`

## D. Manual Supabase steps

1. Create a Supabase project.
2. Open SQL Editor and run `schema.sql`.
3. Run `policies.sql`.
4. Run `seed.sql`.
5. In Authentication → Providers → Email, enable Email.
6. For a hackathon demo, you can turn off email confirmation.
7. Copy the Project URL and anon key from Project Settings → API.

## E. Test checklist

- Login as `admin.hr@hrms.test` with password `Password123!`
- Login as `alice.employee@hrms.test` with password `Password123!`
- Login as `bob.employee@hrms.test` with password `Password123!`
- Confirm employees only see their own data.
- Confirm employees cannot self-escalate their role.
- Confirm employees cannot write payroll.
- Confirm `admin_hr` can view everything and approve/reject leave.
