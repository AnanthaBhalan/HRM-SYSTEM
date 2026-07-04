"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock3, Wallet, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getMyDashboardData, type AttendanceRow, type DocumentRow, type EmployeeRow, type LeaveRequestRow, type PayrollRow, type ProfileRow } from "@/lib/hrms-data";

function formatCurrency(value: number | null | undefined) {
  if (value == null) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [employee, setEmployee] = useState<EmployeeRow | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [leave, setLeave] = useState<LeaveRequestRow[]>([]);
  const [payroll, setPayroll] = useState<PayrollRow[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      const result = await getMyDashboardData(user.id);
      if (!active) return;
      setProfile(result.profile);
      setEmployee(result.employee);
      setAttendance(result.attendance);
      setLeave(result.leave);
      setPayroll(result.payroll);
      setDocuments(result.documents);
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const attendanceRate = attendance.length
    ? Math.round((attendance.filter((item) => item.status === "present" || item.status === "half_day").length / attendance.length) * 100)
    : 0;

  const recentActivity = [
    {
      label: "Attendance records",
      detail: `${attendance.length} recent entries`,
      status: attendance.length ? "success" : "secondary",
    },
    {
      label: "Leave requests",
      detail: `${leave.length} recent requests`,
      status: leave.some((item) => item.status === "pending") ? "warning" : "success",
    },
    {
      label: "Documents",
      detail: `${documents.length} uploaded files`,
      status: documents.length ? "secondary" : "warning",
    },
  ];

  return (
    <AppShell role="employee">
      <PageHeader
        title={profile?.full_name ? `Welcome back, ${profile.full_name}` : "Welcome back"}
        description="Track attendance, review leave, and stay up to date with your HR records."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Attendance" value={`${attendanceRate}%`} hint="Recent records" icon={<Clock3 className="h-5 w-5" />} />
        <StatCard title="Leave" value={`${leave.length}`} hint="Recent requests" icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard title="Payroll" value={formatCurrency(payroll[0]?.net_salary)} hint="Latest payslip" icon={<Wallet className="h-5 w-5" />} />
        <StatCard title="Profile" value={profile ? "Complete" : "Pending"} hint={employee?.designation ?? "Update personal details"} icon={<UserRound className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading your HR records…</p>
            ) : (
              recentActivity.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-3">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.detail}</p>
                  </div>
                  <Badge variant={item.status as any}>{item.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-lg bg-slate-50 p-3">Department: {employee?.department ?? "Pending setup"}</div>
            <div className="rounded-lg bg-slate-50 p-3">Employee code: {employee?.employee_code ?? "—"}</div>
            <div className="rounded-lg bg-slate-50 p-3">HR contact: hr@company.com</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
