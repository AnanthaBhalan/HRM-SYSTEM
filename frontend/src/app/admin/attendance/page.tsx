"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminAttendance, type AttendanceRow } from "@/lib/hrms-data";

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getAdminAttendance();
        setAttendance(data ?? []);
      } catch (err) {
        setError("Failed to load attendance data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const getStatusBadge = (status: string) => {
    const variant = status === "present" ? "success" : status === "absent" ? "danger" : status === "half_day" ? "warning" : "secondary";
    return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
  };

  const rows = attendance.map((item) => ({
    Employee: item.profiles?.full_name ?? item.employee_id,
    Date: item.date,
    Status: getStatusBadge(item.status),
    Notes: item.notes ?? "—",
  }));

  return (
    <AppShell role="admin_hr">
      <PageHeader title="Attendance" description="Review team attendance and exceptions." />
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable title="Attendance overview" columns={["Employee", "Date", "Status", "Notes"]} rows={rows} />
      )}
    </AppShell>
  );
}
