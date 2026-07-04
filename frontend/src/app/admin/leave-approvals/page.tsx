"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminLeaveApprovals, updateLeaveStatus, type LeaveRequestRow } from "@/lib/hrms-data";

export default function AdminLeaveApprovalsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAdminLeaveApprovals();
      setLeaveRequests(data ?? []);
    } catch (err) {
      setError("Failed to load leave requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDecision = async (leaveId: string, status: "approved" | "rejected") => {
    const { error } = await updateLeaveStatus(leaveId, status);
    if (!error) {
      await load();
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "approved" ? "success" : status === "rejected" ? "danger" : status === "pending" ? "warning" : "secondary";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const rows = leaveRequests.map((item) => ({
    Employee: item.profiles?.full_name ?? item.employee_id,
    Type: item.leave_type,
    Dates: `${item.start_date} - ${item.end_date}`,
    Status: getStatusBadge(item.status),
    Action: (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => void handleDecision(item.id, "rejected")}>Reject</Button>
        <Button size="sm" onClick={() => void handleDecision(item.id, "approved")}>Approve</Button>
      </div>
    ),
  }));

  return (
    <AppShell role="admin_hr">
      <PageHeader title="Leave approvals" description="Approve or reject employee leave requests." />
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable title="All requests" columns={["Employee", "Type", "Dates", "Status", "Action"]} rows={rows} />
      )}
    </AppShell>
  );
}
