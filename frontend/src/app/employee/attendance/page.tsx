"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { getMyDashboardData, upsertAttendance, type AttendanceRow } from "@/lib/hrms-data";

export default function EmployeeAttendancePage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getMyDashboardData(user.id);
      setAttendance(result.attendance);
    } catch (err) {
      setError("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const handleAction = async (mode: "check-in" | "check-out") => {
    if (!user?.id) return;
    setActionLoading(true);
    setMessage(null);

    const today = new Date().toISOString().slice(0, 10);
    const todaysEntry = attendance.find((item) => item.date === today);

    if (mode === "check-in") {
      const { error } = await upsertAttendance({ employeeId: user.id, date: today, checkIn: new Date().toISOString(), status: "present" });
      if (!error) {
        await load();
        setMessage("Checked in successfully.");
      } else {
        setMessage(error.message);
      }
    } else if (mode === "check-out") {
      const { error } = await upsertAttendance({ employeeId: user.id, date: today, checkOut: new Date().toISOString(), status: todaysEntry?.status ?? "present" });
      if (!error) {
        await load();
        setMessage("Checked out successfully.");
      } else {
        setMessage(error.message);
      }
    }

    setActionLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "present" ? "success" : status === "absent" ? "danger" : status === "half_day" ? "warning" : "secondary";
    return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
  };

  const rows = attendance.map((item) => ({
    Date: item.date,
    Status: getStatusBadge(item.status),
    "Check-in": item.check_in ? new Date(item.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
    "Check-out": item.check_out ? new Date(item.check_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
  }));

  const today = new Date().toISOString().slice(0, 10);
  const todaysEntry = attendance.find((item) => item.date === today);

  return (
    <AppShell role="employee">
      <PageHeader
        title="Attendance"
        description="Review your recent check-ins and attendance status."
        action={
          <div className="flex gap-2">
            <Button variant="outline" disabled={actionLoading || !!todaysEntry?.check_in} onClick={() => void handleAction("check-in")}>
              {actionLoading ? "Working..." : "Check in"}
            </Button>
            <Button disabled={actionLoading || !todaysEntry?.check_in || !!todaysEntry?.check_out} onClick={() => void handleAction("check-out")}>
              {actionLoading ? "Working..." : "Check out"}
            </Button>
          </div>
        }
      />
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="mb-4 text-sm text-slate-600">{message}</p> : null}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable title="Recent records" columns={["Date", "Status", "Check-in", "Check-out"]} rows={rows} emptyMessage="No attendance entries yet." />
      )}
    </AppShell>
  );
}
