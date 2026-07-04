import { supabase } from "@/lib/supabase";

export type ProfileRole = "employee" | "admin_hr";

export type ProfileRow = {
  id: string;
  role: ProfileRole | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  profile_picture_url: string | null;
};

export type EmployeeRow = {
  id: string;
  employee_code: string;
  department: string | null;
  designation: string | null;
  employment_status: string | null;
  base_salary: number | null;
  manager_id: string | null;
  date_of_joining: string | null;
  created_at?: string;
};

export type AttendanceRow = {
  id: string;
  employee_id: string;
  date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  notes: string | null;
  profiles: { full_name: string } | null;
};

export type LeaveRequestRow = {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
};

export type PayrollRow = {
  id: string;
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  generated_by: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
};

export type DocumentRow = {
  id: string;
  employee_id: string;
  doc_type: string;
  file_name: string | null;
  file_url: string;
  uploaded_by: string | null;
  created_at: string;
};

export async function getMyDashboardData(userId: string) {
  const [profileRes, employeeRes, attendanceRes, leaveRes, payrollRes, documentRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("employees").select("*").eq("id", userId).maybeSingle(),
    supabase.from("attendance_records").select("*").eq("employee_id", userId).order("date", { ascending: false }).limit(10),
    supabase.from("leave_requests").select("*").eq("employee_id", userId).order("created_at", { ascending: false }).limit(10),
    supabase.from("payroll_records").select("*").eq("employee_id", userId).order("pay_period_start", { ascending: false }).limit(10),
    supabase.from("documents").select("*").eq("employee_id", userId).order("created_at", { ascending: false }).limit(10),
  ]);

  return {
    profile: profileRes.data as ProfileRow | null,
    employee: employeeRes.data as EmployeeRow | null,
    attendance: (attendanceRes.data ?? []) as AttendanceRow[],
    leave: (leaveRes.data ?? []) as LeaveRequestRow[],
    payroll: (payrollRes.data ?? []) as PayrollRow[],
    documents: (documentRes.data ?? []) as DocumentRow[],
  };
}

export async function updateMyProfile(userId: string, updates: Partial<Pick<ProfileRow, "phone" | "address" | "profile_picture_url">>) {
  return supabase.from("profiles").update(updates).eq("id", userId);
}

export async function createLeaveRequest(input: { employeeId: string; leaveType: string; startDate: string; endDate: string; reason: string }) {
  return supabase.from("leave_requests").insert({
    employee_id: input.employeeId,
    leave_type: input.leaveType,
    start_date: input.startDate,
    end_date: input.endDate,
    reason: input.reason,
    status: "pending",
  });
}

export async function upsertAttendance(input: { employeeId: string; date: string; checkIn?: string | null; checkOut?: string | null; status?: string; notes?: string | null }) {
  return supabase.from("attendance_records").upsert(
    {
      employee_id: input.employeeId,
      date: input.date,
      check_in: input.checkIn ?? null,
      check_out: input.checkOut ?? null,
      status: input.status ?? "present",
      notes: input.notes ?? null,
    },
    { onConflict: "employee_id,date" },
  );
}

export async function getAdminDashboardData() {
  const [employeeCountRes, attendanceRes, leaveRes, payrollRes, profilesRes] = await Promise.all([
    supabase.from("employees").select("id", { count: "exact", head: true }),
    supabase.from("attendance_records").select("id", { count: "exact", head: true }).eq("date", new Date().toISOString().slice(0, 10)),
    supabase.from("leave_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("payroll_records").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return {
    employeeCount: employeeCountRes.count ?? 0,
    attendanceTodayCount: attendanceRes.count ?? 0,
    pendingLeaves: leaveRes.count ?? 0,
    payrollCount: payrollRes.count ?? 0,
    profileCount: profilesRes.count ?? 0,
  };
}

export async function getAdminEmployees() {
  const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
  return { data: (data ?? []) as EmployeeRow[], error };
}

export async function updateEmployeeRecord(employeeId: string, updates: Partial<Pick<EmployeeRow, "department" | "designation" | "employment_status" | "base_salary">>) {
  return supabase.from("employees").update(updates).eq("id", employeeId);
}

export async function getAdminAttendance() {
  const { data, error } = await supabase
    .from("attendance_records")
    .select("*, profiles(full_name)")
    .order("date", { ascending: false })
    .limit(20);
  return { data: (data ?? []) as AttendanceRow[], error };
}

export async function getAdminLeaveApprovals() {
  const { data, error } = await supabase
    .from("leave_requests")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });
  return { data: (data ?? []) as LeaveRequestRow[], error };
}

export async function updateLeaveStatus(leaveId: string, status: "approved" | "rejected") {
  const { data: userData } = await supabase.auth.getUser();
  return supabase
    .from("leave_requests")
    .update({
      status,
      reviewed_by: userData.user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", leaveId);
}

export async function getAdminPayroll() {
  const { data, error } = await supabase
    .from("payroll_records")
    .select("*, profiles(full_name)")
    .order("pay_period_start", { ascending: false });
  return { data: (data ?? []) as PayrollRow[], error };
}

export async function createPayrollRecord(input: { employeeId: string; payPeriodStart: string; payPeriodEnd: string; basicSalary: number; allowances: number; deductions: number }) {
  return supabase.from("payroll_records").insert({
    employee_id: input.employeeId,
    pay_period_start: input.payPeriodStart,
    pay_period_end: input.payPeriodEnd,
    basic_salary: input.basicSalary,
    allowances: input.allowances,
    deductions: input.deductions,
    generated_by: (await supabase.auth.getUser()).data.user?.id ?? null,
  });
}

export async function createEmployee(input: { fullName: string; email: string; password: string }) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
      },
    },
  });

  if (error) {
    return { error };
  }

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email: input.email,
      full_name: input.fullName,
      role: "employee",
    });

    if (profileError) {
      return { error: profileError };
    }

    const { error: employeeError } = await supabase.from("employees").upsert({
      id: data.user.id,
      employee_code: `EMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });

    if (employeeError) {
      return { error: employeeError };
    }
  }

  return { error: null };
}

export async function uploadProfilePicture(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `profile-pictures/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) {
    return { error: uploadError };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  const { error: updateError } = await updateMyProfile(userId, { profile_picture_url: publicUrl });

  if (updateError) {
    return { error: updateError };
  }

  return { error: null, publicUrl };
}
