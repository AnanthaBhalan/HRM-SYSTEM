"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock3, BadgeCheck, Wallet } from "lucide-react";
import { getAdminDashboardData } from "@/lib/hrms-data";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ employeeCount: 0, attendanceTodayCount: 0, pendingLeaves: 0, payrollCount: 0, profileCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await getAdminDashboardData();
      setStats(result);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <AppShell role="admin_hr">
      <PageHeader title="HR dashboard" description="Monitor staffing, attendance, leave, and payroll in one place." />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Employees" value={stats.employeeCount.toString()} hint="Active staff" icon={<Users className="h-5 w-5" />} />
          <StatCard title="Present today" value={stats.attendanceTodayCount.toString()} hint="Attendance rows" icon={<Clock3 className="h-5 w-5" />} />
          <StatCard title="Pending approvals" value={stats.pendingLeaves.toString()} hint="Leave requests" icon={<BadgeCheck className="h-5 w-5" />} />
          <StatCard title="Payroll" value={stats.payrollCount.toString()} hint="Records" icon={<Wallet className="h-5 w-5" />} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Admin overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-lg border border-slate-200 p-3">Profiles tracked: {stats.profileCount}</div>
            <div className="rounded-lg border border-slate-200 p-3">Attendance rows captured today: {stats.attendanceTodayCount}</div>
            <div className="rounded-lg border border-slate-200 p-3">Payroll records available: {stats.payrollCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">Review leave approvals</div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">Update employee records</div>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">Run payroll batch</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
