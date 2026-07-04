"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/layout/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { createLeaveRequest, getMyDashboardData, type LeaveRequestRow } from "@/lib/hrms-data";

export default function EmployeeLeavePage() {
  const { user } = useAuth();
  const [leave, setLeave] = useState<LeaveRequestRow[]>([]);
  const [form, setForm] = useState({ leaveType: "paid", startDate: "", endDate: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    if (!user?.id) return;
    const result = await getMyDashboardData(user.id);
    setLeave(result.leave);
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;

    setSubmitting(true);
    setMessage(null);
    const { error } = await createLeaveRequest({
      employeeId: user.id,
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Leave request submitted successfully.");
      setForm({ leaveType: "paid", startDate: "", endDate: "", reason: "" });
      await load();
    }

    setSubmitting(false);
  };

  const rows = leave.map((item) => ({
    Type: item.leave_type,
    Dates: `${item.start_date} - ${item.end_date}`,
    Reason: item.reason ?? "—",
    Status: item.status,
  }));

  return (
    <AppShell role="employee">
      <PageHeader title="Leave" description="Submit requests and review your leave history." />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New leave request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Leave type</label>
              <Input value={form.leaveType} onChange={(event) => setForm((current) => ({ ...current, leaveType: event.target.value }))} placeholder="paid" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start date</label>
              <Input type="date" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End date</label>
              <Input type="date" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <Input value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Personal / medical / family" />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit request"}</Button>
              {message ? <p className="text-sm text-slate-600">{message}</p> : null}
            </div>
          </form>
        </CardContent>
      </Card>
      <DataTable title="Leave requests" columns={["Type", "Dates", "Reason", "Status"]} rows={rows} emptyMessage="No leave requests yet." />
    </AppShell>
  );
}
