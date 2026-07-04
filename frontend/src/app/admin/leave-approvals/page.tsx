"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { Button } from "@/components/ui/button";
import { getAdminLeaveApprovals, updateLeaveStatus, type LeaveRequestRow } from "@/lib/hrms-data";

export default function AdminLeaveApprovalsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestRow[]>([]);

  const load = async () => {
    const { data } = await getAdminLeaveApprovals();
    setLeaveRequests(data ?? []);
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

  const rows = leaveRequests.map((item) => ({
    Employee: item.profiles?.full_name ?? item.employee_id,
    Type: item.leave_type,
    Dates: `${item.start_date} - ${item.end_date}`,
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
      <DataTable title="Pending requests" columns={["Employee", "Type", "Dates", "Action"]} rows={rows} />
    </AppShell>
  );
}
