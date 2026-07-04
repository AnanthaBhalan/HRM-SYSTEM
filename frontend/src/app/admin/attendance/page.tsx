"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { getAdminAttendance, type AttendanceRow } from "@/lib/hrms-data";

export default function AdminAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await getAdminAttendance();
      setAttendance(data ?? []);
    };
    void load();
  }, []);

  const rows = attendance.map((item) => ({
    Employee: item.profiles?.full_name ?? item.employee_id,
    Date: item.date,
    Status: item.status,
    Notes: item.notes ?? "—",
  }));

  return (
    <AppShell role="admin_hr">
      <PageHeader title="Attendance" description="Review team attendance and exceptions." />
      <DataTable title="Attendance overview" columns={["Employee", "Date", "Status", "Notes"]} rows={rows} />
    </AppShell>
  );
}
